import { NextResponse } from "next/server";

const INDEXER = "https://deepbook-indexer.testnet.mystenlabs.com";

export async function GET() {
  try {
    const res = await fetch(`${INDEXER}/summary`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`Indexer ${res.status}`);
    const data = await res.json();

    // The indexer returns an object keyed by trading pair or an array
    const pairs: Record<string, any> = Array.isArray(data)
      ? Object.fromEntries(data.map((p: any) => [p.trading_pair, p]))
      : data;

    const sui = pairs["SUI_DBUSDC"] ?? pairs["SUI-DBUSDC"] ?? Object.values(pairs)[0];

    return NextResponse.json({
      price: Number(sui?.last_price ?? 0),
      change24h: Number(sui?.price_change_percent_24h ?? 0),
      high24h: Number(sui?.high_price ?? sui?.highest_price_24h ?? 0),
      low24h: Number(sui?.low_price ?? sui?.lowest_price_24h ?? 0),
      volume24h: Number(sui?.base_volume ?? 0),
      pair: "SUI/USDC",
      source: "DeepBook testnet",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
