"use client";
import Link from "next/link";
import { Bot } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet, useTrades } from "@/hooks/useOnchain";
import { usd } from "@/lib/data";

function Skel() {
  return (
    <div style={{ height: 180, borderRadius: 16, background: "var(--ink-a04)", animation: "tefama-pulse 1.6s ease-in-out infinite", border: "1px solid var(--border-subtle)" }} />
  );
}

export default function AgentsPage() {
  const { address } = useZkLogin();
  const { price } = usePrice();
  const { vault, isLoading: walletLoading } = useWallet(address);
  const { pnl, roi, count, isLoading: tradesLoading } = useTrades(vault?.id, price);

  const isLoading = walletLoading || tradesLoading;
  const spent     = vault?.spent ?? 0;
  const budget    = vault?.budgetCap ?? 0;
  const paused    = vault?.paused ?? false;
  const status    = budget === 0 ? "revoked" : paused ? "paused" : "active";

  return (
    <>
      <TopBar crumbs={[{ label: "My agents" }]} />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>My agents</h1>
            <div className="sub">{isLoading ? "Loading…" : `${status === "active" ? 1 : 0} active · 1 total`}</div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            <Skel />
          </div>
        ) : !vault ? (
          <Card className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
            <Bot size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>
              No vault deployed yet. Add VAULT_ID to your environment to activate the agent.
            </p>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            <Link href="/agents/vault" style={{ textDecoration: "none" }}>
              <div className="agent-card">
                <div className="a-head">
                  <div className="a-ic"><Bot size={20} /></div>
                  <div style={{ flex: 1 }}>
                    <div className="a-name">TEFAMA DCA Agent</div>
                    <div className="a-strat">Dollar-cost averaging · SUI/USDC</div>
                  </div>
                  <Badge status={status as "active" | "paused" | "revoked"} pulse={status === "active"}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>
                    <span>Budget used</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{usd(spent)} / {usd(budget)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: budget > 0 ? `${Math.min((spent / budget) * 100, 100)}%` : "0%" }} />
                  </div>
                </div>
                <div className="a-meta">
                  <div className="am-item">
                    <div className="l">P&L</div>
                    <div className="v" style={{ color: pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {pnl >= 0 ? "+" : ""}{usd(pnl, 4)}
                    </div>
                  </div>
                  <div className="am-item">
                    <div className="l">ROI</div>
                    <div className="v" style={{ color: roi >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
                    </div>
                  </div>
                  <div className="am-item">
                    <div className="l">Trades</div>
                    <div className="v">{count}</div>
                  </div>
                  <div className="am-item">
                    <div className="l">Success</div>
                    <div className="v">100%</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
