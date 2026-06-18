"use client";
import { useRouter } from "next/navigation";
import { Bot, ArrowDownLeft, ExternalLink, OctagonX, RefreshCw } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet, useTrades } from "@/hooks/useOnchain";
import { usd } from "@/lib/data";

export default function AgentDetailsPage() {
  const router = useRouter();
  const { address } = useZkLogin();
  const { price } = usePrice();
  const { vault, isLoading: walletLoading } = useWallet(address);
  const { trades, pnl, roi, count, isLoading: tradesLoading, refresh } = useTrades(vault?.id, price);

  const spent  = vault?.spent ?? 0;
  const budget = vault?.budgetCap ?? 0;
  const paused = vault?.paused ?? false;
  const status = budget === 0 ? "revoked" : paused ? "paused" : "active";

  if (!walletLoading && !vault) {
    return (
      <>
        <TopBar crumbs={[{ label: "My agents", path: "/agents" }, { label: "TEFAMA DCA Agent" }]} />
        <div className="page">
          <Card className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
            <Bot size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>No vault configured. Add VAULT_ID to activate.</p>
            <div style={{ marginTop: 16 }}><Button variant="secondary" onClick={() => router.push("/agents")}>Back</Button></div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar crumbs={[{ label: "My agents", path: "/agents" }, { label: "TEFAMA DCA Agent" }]}>
        <Button variant="secondary" size="sm" icon={<RefreshCw size={15} />} onClick={() => refresh()}>Refresh</Button>
        {status === "active" && (
          <Button variant="danger" size="sm" icon={<OctagonX size={15} />} onClick={() => {}}>Pause</Button>
        )}
      </TopBar>
      <div className="page">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--brand-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange-400)" }}>
            <Bot size={26} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>TEFAMA DCA Agent</h1>
              <Badge status={status as "active" | "paused" | "revoked"} pulse={status === "active"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Dollar-cost averaging · SUI/USDC · {count} trades
            </div>
          </div>
        </div>

        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "P&L", value: (pnl >= 0 ? "+" : "") + usd(pnl, 4), color: pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" },
            { label: "ROI", value: (roi >= 0 ? "+" : "") + roi.toFixed(2) + "%", color: roi >= 0 ? "var(--orange-400)" : "var(--ember-500)" },
            { label: "Volume", value: usd(spent), color: undefined },
            { label: "Executions", value: String(count), color: undefined },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat panel">
              <div className="s-top"><span className="s-lab">{label}</span></div>
              <div className="s-val" style={color ? { color } : {}}>{walletLoading || tradesLoading ? "—" : value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          <Card className="panel">
            <div className="panel-head"><h3>Budget</h3></div>
            <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)" }}>
              <span>{usd(spent)} spent</span>
              <span>{usd(budget)} cap</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: budget > 0 ? `${Math.min((spent / budget) * 100, 100)}%` : "0%" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 8 }}>
              {usd(budget - spent)} remaining ({budget > 0 ? (100 - (spent / budget) * 100).toFixed(1) : 100}%)
            </div>
          </Card>

          <Card className="panel">
            <div className="panel-head"><h3>Details</h3></div>
            <div className="dl">
              {[
                ["Strategy", "DCA"],
                ["Pair", "SUI / USDC"],
                ["Network", "Sui Testnet"],
                ["Status", status],
              ].map(([k, v]) => (
                <div key={k} className="r" style={{ padding: "8px 0" }}>
                  <span className="k" style={{ fontSize: 13 }}>{k}</span>
                  <span className="v" style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head"><h3>Recent executions</h3></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>{["Type", "Asset", "Received", "Spent", "Price", "Time", ""].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {tradesLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      {[1,2,3,4,5,6,7].map(j => (
                        <td key={j}><div style={{ width: 60, height: 14, borderRadius: 4, background: "var(--ink-a08)", animation: "tefama-pulse 1.6s ease-in-out infinite" }} /></td>
                      ))}
                    </tr>
                  ))
                ) : trades.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-tertiary)" }}>
                      No on-chain executions yet. The agent runs daily at 9 AM UTC.
                    </td>
                  </tr>
                ) : (
                  trades.slice(0, 10).map((tx: any) => (
                    <tr key={tx.id}>
                      <td><span className="tag tag-buy"><ArrowDownLeft size={12} /> buy</span></td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>SUI</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{tx.baseReceived.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{usd(tx.quoteSpent, 4)}</td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{usd(tx.price, 4)}</td>
                      <td style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{tx.time}</td>
                      <td>
                        <a href={tx.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "var(--text-disabled)" }}>
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
