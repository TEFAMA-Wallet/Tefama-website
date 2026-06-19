"use client";
import { TrendingUp, TrendingDown, Target, Zap, BarChart3, ArrowDownLeft } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet, useTrades } from "@/hooks/useOnchain";
import { usd } from "@/lib/data";

function Skel({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 5, background: "var(--ink-a08)", animation: "tefama-pulse 1.6s ease-in-out infinite", display: "inline-block" }} />;
}

function StatPill({ label, value, sub, color, loading }: {
  label: string; value: string; sub?: string; color?: string; loading?: boolean;
}) {
  return (
    <div className="stat panel">
      <div className="s-top"><span className="s-lab">{label}</span></div>
      <div className="s-val" style={color ? { color } : {}}>
        {loading ? <Skel w={100} h={28} /> : value}
      </div>
      {sub && <div className="txt-ter" style={{ fontSize: 12, marginTop: 6 }}>{loading ? <Skel w={80} /> : sub}</div>}
    </div>
  );
}

function MarketRow({ label, value, change, loading }: { label: string; value: string; change?: number; loading?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {loading ? <Skel w={70} /> : (
          <>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>{value}</span>
            {change !== undefined && (
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: change >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { address } = useZkLogin();
  const { price, deepPrice, deepChange24h, change24h, high24h, low24h, volume24h, isLoading: priceLoading } = usePrice();
  const { vault, suiBalance, usdcBalance, deepBalance, isLoading: walletLoading } = useWallet(address);
  const { trades, pnl, roi, count, isLoading: tradesLoading } = useTrades(vault?.id, deepPrice);

  const isLoading   = priceLoading || walletLoading || tradesLoading;
  const totalValue  = suiBalance * price + usdcBalance + deepBalance * deepPrice;
  const spent       = vault?.spent ?? 0;
  const budgetCap   = vault?.budgetCap ?? 0;

  const totalDeepAccumulated = trades.reduce((s: number, t: any) => s + t.baseReceived, 0);
  const totalSuiSpent        = trades.reduce((s: number, t: any) => s + t.quoteSpent, 0);
  const avgBuyPrice          = totalDeepAccumulated > 0 ? totalSuiSpent / totalDeepAccumulated : 0;
  const currentDeepValueSui  = totalDeepAccumulated * (deepPrice / price);
  const unrealisedSui        = currentDeepValueSui - totalSuiSpent;

  // Portfolio allocation
  const suiUsd  = suiBalance * price;
  const deepUsd = deepBalance * deepPrice;
  const allocs  = [
    { sym: "SUI",  usd_: suiUsd,  color: "#6FBCF0" },
    { sym: "USDC", usd_: usdcBalance, color: "#2775CA" },
    { sym: "DEEP", usd_: deepUsd, color: "var(--orange-400)" },
  ];
  const totalForAlloc = allocs.reduce((s, a) => s + a.usd_, 0) || 1;

  return (
    <>
      <TopBar crumbs={[{ label: "Analytics" }]} />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Analytics</h1>
            <div className="sub">Live performance · Sui testnet · DeepBook</div>
          </div>
        </div>

        {/* Top stats */}
        <div className="stat-grid rise">
          <StatPill
            label="Unrealised P&L"
            value={(pnl >= 0 ? "+" : "") + usd(pnl, 4)}
            sub={(roi >= 0 ? "+" : "") + roi.toFixed(2) + "% ROI on capital deployed"}
            color={pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)"}
            loading={isLoading}
          />
          <StatPill
            label="Total trades"
            value={String(count)}
            sub={count > 0 ? `${totalSuiSpent.toFixed(4)} SUI total spent` : "No trades yet"}
            loading={isLoading}
          />
          <StatPill
            label="DEEP accumulated"
            value={totalDeepAccumulated > 0 ? totalDeepAccumulated.toFixed(4) : "0"}
            sub={totalDeepAccumulated > 0 ? `≈ ${usd(deepUsd + deepBalance * deepPrice, 2)} current value` : "—"}
            loading={isLoading}
          />
          <StatPill
            label="Portfolio value"
            value={usd(totalValue, 2)}
            sub={`SUI · USDC · DEEP`}
            loading={isLoading}
          />
        </div>

        {/* Market + Portfolio side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
          {/* Live market */}
          <Card className="panel">
            <div className="panel-head">
              <h3>Live market</h3>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>DeepBook testnet · updates every 20s</span>
            </div>
            <MarketRow label="SUI / USD"   value={usd(price, 4)}     change={change24h}    loading={priceLoading} />
            <MarketRow label="SUI 24h high" value={usd(high24h, 4)}                         loading={priceLoading} />
            <MarketRow label="SUI 24h low"  value={usd(low24h, 4)}                          loading={priceLoading} />
            <MarketRow label="DEEP / SUI"   value={(deepPrice / price).toFixed(5) + " SUI"} change={deepChange24h} loading={priceLoading} />
            <MarketRow label="DEEP / USD"   value={usd(deepPrice, 4)} change={deepChange24h} loading={priceLoading} />
            <div style={{ paddingTop: 10 }}>
              <MarketRow label="24h volume" value={volume24h > 0 ? usd(volume24h, 0) : "—"} loading={priceLoading} />
            </div>
          </Card>

          {/* Portfolio allocation */}
          <Card className="panel">
            <div className="panel-head"><h3>Portfolio allocation</h3></div>
            <div style={{ marginBottom: 16 }}>
              {allocs.map(a => {
                const pct = Math.round((a.usd_ / totalForAlloc) * 100);
                return (
                  <div key={a.sym} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{a.sym}</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                        {isLoading ? "—" : usd(a.usd_, 2)} · {isLoading ? "—" : pct + "%"}
                      </span>
                    </div>
                    <div style={{ height: 7, borderRadius: 4, background: "var(--ink-a08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: isLoading ? "0%" : `${pct}%`, background: a.color, borderRadius: 4, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-tertiary)" }}>Total</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{isLoading ? <Skel w={80} /> : usd(totalValue, 2)}</span>
            </div>
          </Card>
        </div>

        {/* Agent performance */}
        <Card className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <h3>DCA Agent · performance</h3>
            <Badge status={!vault ? "revoked" : vault.paused ? "paused" : "active"} pulse={!vault?.paused && !!vault}>
              {!vault ? "No vault" : vault.paused ? "Paused" : "Active"}
            </Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border-subtle)", borderRadius: 10, overflow: "hidden" }}>
            {[
              { l: "Strategy",        v: "Dollar-cost averaging" },
              { l: "Pair",            v: "SUI → DEEP" },
              { l: "Trade size",      v: "0.3 SUI per execution" },
              { l: "Budget cap",      v: isLoading ? null : budgetCap > 0 ? `${budgetCap.toFixed(4)} SUI / 24h` : "—" },
              { l: "SUI spent",       v: isLoading ? null : `${spent.toFixed(4)} SUI` },
              { l: "DEEP bought",     v: isLoading ? null : totalDeepAccumulated > 0 ? totalDeepAccumulated.toFixed(4) + " DEEP" : "—" },
              { l: "Avg buy price",   v: isLoading ? null : avgBuyPrice > 0 ? usd(avgBuyPrice, 4) + " / DEEP" : "—" },
              { l: "Current price",   v: priceLoading ? null : usd(deepPrice, 4) + " / DEEP" },
              { l: "Unrealised gain", v: isLoading ? null : unrealisedSui !== 0 ? (unrealisedSui >= 0 ? "+" : "") + unrealisedSui.toFixed(4) + " SUI" : "—" },
            ].map(({ l, v }) => (
              <div key={l} style={{ background: "var(--surface-base)", padding: "14px 18px" }}>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{l}</div>
                <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {v === null ? <Skel w={80} /> : v}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent trade history */}
        <Card className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <h3>Trade history</h3>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{count} total</span>
          </div>
          {tradesLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
              {[1, 2, 3].map(i => <Skel key={i} w="100%" h={40} />)}
            </div>
          ) : trades.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: "var(--text-tertiary)", fontSize: 14 }}>
              <BarChart3 size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
              No trades yet. Run the agent to see data here.
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>{["", "DEEP bought", "SUI spent", "Price (USD)", "Current price", "P&L on trade", "Time"].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {trades.map((tx: any, i: number) => {
                    const currentVal = tx.baseReceived * deepPrice;
                    const spentUsd   = tx.quoteSpent * price;
                    const tradePnl   = currentVal - spentUsd;
                    return (
                      <tr key={tx.id}>
                        <td><span className="tag tag-buy"><ArrowDownLeft size={12} /> buy</span></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{tx.baseReceived.toFixed(4)}</td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{tx.quoteSpent.toFixed(4)} SUI</td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{usd(tx.price, 4)}</td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{usd(deepPrice, 4)}</td>
                        <td style={{ fontFamily: "var(--font-mono)", color: tradePnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                          {tradePnl >= 0 ? "+" : ""}{usd(tradePnl, 4)}
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{tx.time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </>
  );
}
