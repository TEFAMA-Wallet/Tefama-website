"use client";
import { ArrowDownLeft, ExternalLink, RefreshCw, Activity } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet, useTrades } from "@/hooks/useOnchain";
import { usd } from "@/lib/data";

function SkelRow() {
  return (
    <tr>
      {[80, 50, 90, 80, 70, 60, 90, 20].map((w, i) => (
        <td key={i}>
          <div style={{ width: w, height: 14, borderRadius: 4, background: "var(--ink-a08)", animation: "tefama-pulse 1.6s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

export default function ActivityPage() {
  const { address } = useZkLogin();
  const { price, deepPrice } = usePrice();
  const { vault } = useWallet(address);
  const { trades, pnl, roi, count, isLoading, refresh } = useTrades(vault?.id, deepPrice);

  const totalSuiSpent        = trades.reduce((s: number, t: any) => s + t.quoteSpent, 0);
  const totalDeepAccumulated = trades.reduce((s: number, t: any) => s + t.baseReceived, 0);

  return (
    <>
      <TopBar crumbs={[{ label: "Activity" }]}>
        <button
          onClick={() => refresh()}
          style={{ background: "var(--ink-a04)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </TopBar>
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Activity log</h1>
            <div className="sub">All on-chain executions from your vault · Sui testnet</div>
          </div>
        </div>

        {/* Summary strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { l: "Total trades",      v: isLoading ? null : String(count) },
            { l: "SUI spent",         v: isLoading ? null : totalSuiSpent > 0 ? totalSuiSpent.toFixed(4) + " SUI" : "—" },
            { l: "DEEP accumulated",  v: isLoading ? null : totalDeepAccumulated > 0 ? totalDeepAccumulated.toFixed(4) + " DEEP" : "—" },
            { l: "Unrealised P&L",    v: isLoading ? null : (pnl >= 0 ? "+" : "") + usd(pnl, 4), color: pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" },
          ].map(({ l, v, color }: any) => (
            <div key={l} style={{ background: "var(--ink-a04)", borderRadius: 12, padding: "14px 18px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{l}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, color: color ?? "var(--text-primary)" }}>
                {v === null
                  ? <div style={{ width: 80, height: 20, borderRadius: 4, background: "var(--ink-a08)", animation: "tefama-pulse 1.6s ease-in-out infinite" }} />
                  : v}
              </div>
            </div>
          ))}
        </div>

        <Card className="panel">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>{["Type", "Asset", "DEEP received", "SUI spent", "Price", "Value now", "Status", "Time", ""].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => <SkelRow key={i} />)
                ) : trades.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "56px 0", color: "var(--text-tertiary)" }}>
                      <Activity size={32} style={{ margin: "0 auto 12px", opacity: 0.25 }} />
                      <div>No on-chain trades found yet.</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>Run the agent to see live execution data here.</div>
                    </td>
                  </tr>
                ) : (
                  trades.map((tx: any) => {
                    const currentVal = tx.baseReceived * deepPrice;
                    const spentUsd   = tx.quoteSpent * price;
                    const tradePnl   = currentVal - spentUsd;
                    return (
                      <tr key={tx.id}>
                        <td><span className="tag tag-buy"><ArrowDownLeft size={12} /> buy</span></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--orange-400)" }}>DEEP</td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>
                          {tx.baseReceived.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{tx.quoteSpent.toFixed(4)} SUI</td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {usd(tx.price, 4)}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", color: tradePnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                          {tradePnl >= 0 ? "+" : ""}{usd(tradePnl, 4)}
                        </td>
                        <td><span className="tag tag-ok">confirmed</span></td>
                        <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>{tx.time}</td>
                        <td>
                          <a href={tx.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "var(--text-disabled)", cursor: "pointer", display: "flex" }}>
                            <ExternalLink size={13} />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
