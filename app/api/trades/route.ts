import { NextRequest, NextResponse } from "next/server";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";

const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as "testnet" | "mainnet";
const PKG_ID  = process.env.TEFAMA_PACKAGE_ID ?? "0xf8cfd942cfe8332f0d98e3dbab38d26c3ea641531010e1bbf06e45c0199d97a1";

const sui = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(NETWORK), network: NETWORK });

function relTime(ms: number): string {
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export async function GET(req: NextRequest) {
  const vaultId = req.nextUrl.searchParams.get("vault") ?? "";

  try {
    const [settled, charged] = await Promise.all([
      sui.queryEvents({
        query: { MoveEventType: `${PKG_ID}::vault::TradeSettled` },
        limit: 50,
        order: "descending",
      }),
      sui.queryEvents({
        query: { MoveEventType: `${PKG_ID}::vault::Charged` },
        limit: 50,
        order: "descending",
      }),
    ]);

    const trades = settled.data
      .filter((e: any) => !vaultId || (e.parsedJson as any)?.vault_id === vaultId)
      .map((e: any) => {
        const f = e.parsedJson as any;
        // Vault trades SUI (quote, 9 decimals) → DEEP (base, 9 decimals)
        const quoteSpent   = Number(f.quote_spent   ?? f.amount   ?? 0) / 1e9;
        const baseReceived = Number(f.base_received  ?? f.base_out ?? 0) / 1e9;
        // price = SUI per DEEP
        const price = baseReceived > 0 ? quoteSpent / baseReceived : 0;
        return {
          id: e.id.txDigest,
          digest: e.id.txDigest,
          type: "buy",
          asset: "DEEP",
          quoteSpent,
          baseReceived,
          price,
          agent: f.agent ?? "agent",
          timestampMs: Number(e.timestampMs ?? 0),
          time: relTime(Number(e.timestampMs ?? 0)),
          status: "confirmed",
          explorerUrl: `https://suiscan.xyz/testnet/tx/${e.id.txDigest}`,
        };
      });

    // Compute P&L summary if we have a current price (caller supplies it)
    const currentPrice = Number(req.nextUrl.searchParams.get("price") ?? 0);
    let pnl = 0, roi = 0;
    if (currentPrice > 0 && trades.length > 0) {
      const totalSpent    = trades.reduce((s: number, t: any) => s + t.quoteSpent, 0);
      const totalAcquired = trades.reduce((s: number, t: any) => s + t.baseReceived, 0);
      const currentValue  = totalAcquired * currentPrice;
      pnl = currentValue - totalSpent;
      roi = totalSpent > 0 ? (pnl / totalSpent) * 100 : 0;
    }

    return NextResponse.json({ trades, pnl, roi, count: trades.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
