import { NextRequest, NextResponse } from "next/server";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const NETWORK    = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as "testnet" | "mainnet";
const PKG_ID     = process.env.TEFAMA_PACKAGE_ID ?? "";
const VAULT_ID   = process.env.VAULT_ID ?? "";
const DB_PKG     = process.env.DEEPBOOK_PKG ?? "0x22be4cade64bf2d02412c7e8d0e8beea2f78828b948118d46735315409371a3c";
const POOL_ID    = process.env.POOL_ID ?? "0x1c19362ca52b8ffd7a33cee805a67d40f31e6ba303753fd3a4cfdfacea7163a5";
const QUOTE_TYPE = process.env.QUOTE_TYPE ?? "0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7::usdc::USDC";
const BASE_TYPE  = process.env.BASE_TYPE  ?? "0x2::sui::SUI";
const DEEP_TYPE  = process.env.DEEP_TYPE  ?? "0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP";
const CLOCK_ID   = "0x6";
const DCA_CLIP   = BigInt(process.env.DCA_CLIP ?? "190000000");

const INDEXER = "https://deepbook-indexer.testnet.mystenlabs.com";

// Vercel cron secret check
function authorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not set — allow (dev)
  return auth === `Bearer ${secret}`;
}

async function getPrice(): Promise<{ price: number; low24h: number }> {
  const res = await fetch(`${INDEXER}/summary`, { cache: "no-store" });
  const data = await res.json();
  const pairs: Record<string, any> = Array.isArray(data)
    ? Object.fromEntries(data.map((p: any) => [p.trading_pair, p]))
    : data;
  const p = pairs["SUI_DBUSDC"] ?? Object.values(pairs)[0];
  return {
    price: Number(p?.last_price ?? 0),
    low24h: Number(p?.low_price ?? p?.lowest_price_24h ?? 0),
  };
}

async function executeDCA(suiClient: SuiJsonRpcClient, agentKeypair: Ed25519Keypair): Promise<string> {
  const agentAddress = agentKeypair.toSuiAddress();
  const tx = new Transaction();

  const [quoteCoin, receipt] = tx.moveCall({
    target: `${PKG_ID}::vault::request_trade`,
    typeArguments: [QUOTE_TYPE, BASE_TYPE],
    arguments: [
      tx.object(VAULT_ID),
      tx.pure.u64(DCA_CLIP),
      tx.pure.u64(0),
      tx.object(CLOCK_ID),
    ],
  });

  const deepFee = tx.moveCall({ target: "0x2::coin::zero", typeArguments: [DEEP_TYPE] });
  const [base, quoteLeft, deepLeft] = tx.moveCall({
    target: `${DB_PKG}::pool::swap_exact_quote_for_base`,
    typeArguments: [BASE_TYPE, QUOTE_TYPE],
    arguments: [tx.object(POOL_ID), quoteCoin, deepFee, tx.pure.u64(1), tx.object(CLOCK_ID)],
  });

  tx.moveCall({
    target: `${PKG_ID}::vault::settle_trade`,
    typeArguments: [QUOTE_TYPE, BASE_TYPE],
    arguments: [tx.object(VAULT_ID), receipt, base, quoteLeft],
  });

  tx.transferObjects([deepLeft], agentAddress);

  const res = await suiClient.signAndExecuteTransaction({
    signer: agentKeypair,
    transaction: tx,
    options: { showEffects: true, showEvents: true },
  });

  await suiClient.waitForTransaction({ digest: res.digest });
  if (res.effects?.status.status !== "success") {
    throw new Error(`TX failed: ${res.effects?.status.error}`);
  }
  return res.digest;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!PKG_ID || !VAULT_ID) {
    return NextResponse.json({ skipped: true, reason: "Agent not configured — set TEFAMA_PACKAGE_ID and VAULT_ID env vars" });
  }

  const agentSecret = process.env.AGENT_SECRET_KEY;
  if (!agentSecret) {
    return NextResponse.json({ skipped: true, reason: "AGENT_SECRET_KEY not set" });
  }

  try {
    // DCA strategy: buy unless price is >5% above 24h low (avoid chasing spikes)
    const { price, low24h } = await getPrice();
    if (low24h > 0 && price > low24h * 1.05) {
      return NextResponse.json({ skipped: true, reason: `Price ${price} too high vs 24h low ${low24h}`, price });
    }

    const suiClient = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(NETWORK), network: NETWORK });
    const agentKeypair = Ed25519Keypair.fromSecretKey(agentSecret);
    const digest = await executeDCA(suiClient, agentKeypair);

    return NextResponse.json({ success: true, digest, price, strategy: "DCA" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Budget exhausted or vault paused — not a server error
    if (msg.includes("EOverBudget") || msg.includes("EPaused") || msg.includes("EExpired")) {
      return NextResponse.json({ skipped: true, reason: msg });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
