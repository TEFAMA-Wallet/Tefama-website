import { NextResponse } from "next/server";

const INDEXER = "https://deepbook-indexer.testnet.mystenlabs.com";

export async function GET() {
  try {
    const res = await fetch(`${INDEXER}/summary`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`Indexer ${res.status}`);
    const data = await res.json();

    const pairs: Record<string, any> = Array.isArray(data)
      ? Object.fromEntries(data.map((p: any) => [p.trading_pairs, p]))
      : data;

    const sui  = pairs["SUI_DBUSDC"]  ?? {};
    const deep = pairs["DEEP_SUI"]    ?? {};

    const suiPrice  = Number(sui.last_price  ?? 0);
    const deepInSui = Number(deep.last_price ?? 0);
    const deepPrice = deepInSui * suiPrice;

    return NextResponse.json({
      // SUI price (in USDC)
      price:     suiPrice,
      change24h: Number(sui.price_change_percent_24h ?? 0),
      high24h:   Number(sui.highest_price_24h ?? 0),
      low24h:    Number(sui.lowest_price_24h  ?? 0),
      volume24h: Number(sui.base_volume        ?? 0),
      pair:      "SUI/USDC",
      // DEEP price (in USD, derived via DEEP/SUI * SUI/USDC)
      deepPrice,
      deepInSui,
      deepChange24h: Number(deep.price_change_percent_24h ?? 0),
      source: "DeepBook testnet",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
