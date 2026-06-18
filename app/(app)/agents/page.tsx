"use client";
import Link from "next/link";
import { Bot, ArrowDownLeft, ExternalLink, Plus, Play } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet, useTrades } from "@/hooks/useOnchain";
import { usd } from "@/lib/data";

function Skel({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "var(--ink-a08)", animation: "tefama-pulse 1.6s ease-in-out infinite" }} />;
}

export default function AgentsPage() {
  const { address } = useZkLogin();
  const { price, deepPrice } = usePrice();
  const { vault, isLoading: walletLoading } = useWallet(address);
  const { trades, pnl, roi, count, isLoading: tradesLoading } = useTrades(vault?.id, deepPrice);

  const isLoading = walletLoading || tradesLoading;
  const spent  = vault?.spent ?? 0;
  const budget = vault?.budgetCap ?? 0;
  const paused = vault?.paused ?? false;
  const status = budget === 0 ? "revoked" : paused ? "paused" : "active";
  const pct    = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;

  return (
    <>
      <TopBar crumbs={[{ label: "My agents" }]} />
      <div className="page">

        {/* Hero agent card */}
        <Card variant="raised" glow className="rise" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--brand-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange-400)", flexShrink: 0 }}>
              <Bot size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>TEFAMA DCA Agent</span>
                {isLoading
                  ? <Skel w={60} h={22} />
                  : <Badge status={status as "active" | "paused" | "revoked"} pulse={status === "active"}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                }
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Dollar-cost averaging · SUI → DEEP · DeepBook testnet
              </div>
            </div>
          </div>

          {/* Budget bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
              <span>Budget used</span>
              {isLoading ? <Skel w={120} h={16} /> : <span style={{ fontFamily: "var(--font-mono)" }}>{usd(spent)} of {usd(budget)} cap</span>}
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, transition: "width 0.6s ease" }} />
            </div>
            {!isLoading && (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 6 }}>
                {usd(remaining)} remaining · resets every 24h window
              </div>
            )}
          </div>

          {/* 4 stat pills */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { l: "P&L",    v: isLoading ? null : (pnl >= 0 ? "+" : "") + usd(pnl, 4),   color: pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" },
              { l: "ROI",    v: isLoading ? null : (roi >= 0 ? "+" : "") + roi.toFixed(2) + "%", color: roi >= 0 ? "var(--orange-400)" : "var(--ember-500)" },
              { l: "Trades", v: isLoading ? null : String(count),  color: undefined },
              { l: "Success",v: isLoading ? null : count > 0 ? "100%" : "—", color: undefined },
            ].map(({ l, v, color }) => (
              <div key={l} style={{ background: "var(--ink-a04)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{l}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16, color: color ?? "var(--text-primary)" }}>
                  {v ?? <Skel w={60} h={18} />}
                </div>
              </div>
            ))}
          </div>

          {/* CTA — lives in the card body, not the navbar */}
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/agents/new" style={{ flex: 1 }}>
              <Button variant="primary" block icon={<Play size={15} />}>Run agent now</Button>
            </Link>
            <Link href="/agents/vault">
              <Button variant="secondary">Vault settings</Button>
            </Link>
          </div>
        </Card>

        {/* Strategy + details side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <Card className="panel">
            <div className="panel-head"><h3>Strategy</h3></div>
            <div className="dl">
              {[
                ["Type",       "Dollar-cost averaging"],
                ["Pair",       "SUI → DEEP"],
                ["Trade size", "0.19 SUI per execution"],
                ["Schedule",   "Daily at 9:00 AM UTC"],
                ["Rule",       "Buy when price ≤ 24h low + 5%"],
                ["Network",    "Sui Testnet"],
              ].map(([k, v]) => (
                <div key={k} className="r">
                  <span className="k">{k}</span>
                  <span className="v" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="panel">
            <div className="panel-head"><h3>Live market</h3></div>
            <div className="dl">
              {[
                ["SUI price",   isLoading ? "—" : usd(price, 4)],
                ["DEEP price",  isLoading ? "—" : usd(deepPrice, 4)],
                ["DEEP/SUI",   isLoading ? "—" : (deepPrice / price).toFixed(5) + " SUI"],
                ["Vault SUI",  isLoading ? "—" : usd(budget) + " cap"],
                ["Spent",      isLoading ? "—" : usd(spent)],
                ["Remaining",  isLoading ? "—" : usd(remaining)],
              ].map(([k, v]) => (
                <div key={k} className="r">
                  <span className="k">{k}</span>
                  <span className="v" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent trades preview */}
        <Card className="panel">
          <div className="panel-head">
            <h3>Recent executions</h3>
            <Link href="/activity" style={{ fontSize: 13, color: "var(--orange-400)", textDecoration: "none" }}>View all →</Link>
          </div>
          {isLoading ? (
            <div style={{ padding: "20px 0" }}><Skel w="100%" h={40} /></div>
          ) : trades.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: "var(--text-tertiary)", fontSize: 14 }}>
              No trades yet — click <strong style={{ color: "var(--text-primary)" }}>Run agent</strong> above to execute the first trade.
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>{["Type", "Received", "Spent (SUI)", "Price", "Time", ""].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {trades.slice(0, 5).map((tx: any) => (
                    <tr key={tx.id}>
                      <td><span className="tag tag-buy"><ArrowDownLeft size={12} /> buy</span></td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{tx.baseReceived.toLocaleString(undefined, { maximumFractionDigits: 4 })} DEEP</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{tx.quoteSpent.toFixed(4)} SUI</td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{usd(tx.price, 4)}</td>
                      <td style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{tx.time}</td>
                      <td>
                        <a href={tx.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "var(--text-disabled)" }}>
                          <ExternalLink size={13} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </>
  );
}
