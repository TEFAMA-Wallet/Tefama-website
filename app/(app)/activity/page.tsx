"use client";
import { ArrowDownLeft, ExternalLink, RefreshCw } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet, useTrades } from "@/hooks/useOnchain";
import { usd } from "@/lib/data";

function Skeleton() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <td key={i}>
          <div style={{ width: 60, height: 16, borderRadius: 4, background: "var(--ink-a08)", animation: "tefama-pulse 1.6s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

export default function ActivityPage() {
  const { address } = useZkLogin();
  const { price } = usePrice();
  const { vault } = useWallet(address);
  const { trades, pnl, roi, count, isLoading, refresh } = useTrades(vault?.id, price);

  return (
    <>
      <TopBar crumbs={[{ label: "Dashboard", path: "/dashboard" }, { label: "Activity" }]} />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Activity log</h1>
            <div className="sub">All on-chain executions from your vault · Sui testnet</div>
          </div>
          <button
            onClick={() => refresh()}
            style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Summary */}
        {count > 0 && (
          <div style={{ display: "flex", gap: 20, marginBottom: 20, padding: "14px 20px", background: "var(--ink-a04)", borderRadius: 12, border: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total trades</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20 }}>{count}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>P&L</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, color: pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                {pnl >= 0 ? "+" : ""}{usd(pnl, 4)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>ROI</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, color: roi >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        <Card className="panel">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>{["Type", "Asset", "Amount", "Spent", "Price", "Status", "Time", ""].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => <Skeleton key={i} />)
                ) : trades.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "var(--text-tertiary)" }}>
                      No on-chain trades found yet. Launch an agent to start trading.
                    </td>
                  </tr>
                ) : (
                  trades.map((tx: any) => (
                    <tr key={tx.id}>
                      <td>
                        <span className="tag tag-buy">
                          <ArrowDownLeft size={12} /> buy
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>SUI</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>
                        {tx.baseReceived.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{usd(tx.quoteSpent, 4)}</td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                        {usd(tx.price, 4)}
                      </td>
                      <td><span className="tag tag-ok">confirmed</span></td>
                      <td style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{tx.time}</td>
                      <td>
                        <a href={tx.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "var(--text-disabled)", cursor: "pointer" }}>
                          <ExternalLink size={13} />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
