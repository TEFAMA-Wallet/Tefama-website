import { NextRequest, NextResponse } from "next/server";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";

const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as "testnet" | "mainnet";
const VAULT_ID = process.env.VAULT_ID ?? "";
const PKG_ID   = process.env.TEFAMA_PACKAGE_ID ?? "0xf8cfd942cfe8332f0d98e3dbab38d26c3ea641531010e1bbf06e45c0199d97a1";

// Accept multiple USDC variants that exist on testnet (do NOT include SUI/QUOTE_TYPE here)
const USDC_TYPES = [
  "0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7::usdc::USDC",
  "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC",
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
];

const DEEP_TYPE = process.env.DEEP_TYPE ??
  "0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP";

const sui = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(NETWORK), network: NETWORK });

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  if (!address || address.length < 10) {
    return NextResponse.json({ error: "invalid address" }, { status: 400 });
  }

  try {
    const [balances, vaultRes] = await Promise.all([
      sui.getAllBalances({ owner: address }),
      VAULT_ID
        ? sui.getObject({ id: VAULT_ID, options: { showContent: true } })
        : Promise.resolve(null),
    ]);

    const sui_ = balances.find((b: any) => b.coinType === "0x2::sui::SUI");
    const usdc = balances.find((b: any) => USDC_TYPES.includes(b.coinType));
    const deep = balances.find((b: any) => b.coinType === DEEP_TYPE);

    const suiBalance  = Number(sui_?.totalBalance  ?? 0) / 1e9;
    const usdcBalance = Number(usdc?.totalBalance  ?? 0) / 1e6;
    const deepBalance = Number(deep?.totalBalance  ?? 0) / 1e6;

    // Parse vault fields if available
    const vaultFields = (vaultRes?.data?.content as any)?.fields ?? null;
    const budgetCap = vaultFields ? Number(vaultFields.budget ?? vaultFields.budget_cap ?? 0) / 1e9 : null;
    const spent     = vaultFields ? Number(vaultFields.spent ?? 0) / 1e9 : null;
    const paused    = vaultFields?.paused ?? null;

    return NextResponse.json({
      suiBalance,
      usdcBalance,
      deepBalance,
      vault: vaultFields ? { budgetCap, spent, paused, id: VAULT_ID } : null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
