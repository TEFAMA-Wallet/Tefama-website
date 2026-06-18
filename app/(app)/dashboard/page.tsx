"use client";
import { useState } from "react";
import Link from "next/link";
import { Wallet, Bot, Repeat, TrendingUp, Plus, ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet, useTrades } from "@/hooks/useOnchain";
import { usd, pct } from "@/lib/data";

function Skeleton({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 6,
      background: "var(--ink-a08)",
      animation: "tefama-pulse 1.6s ease-in-out infinite",
    }} />
  );
}

function StatCard({ label, Icon, value, delta, deltaUp, sub, loading }: {
  label: string; Icon: React.ElementType; value: string;
  delta?: string; deltaUp?: boolean; sub?: string; loading?: boolean;
}) {
  return (
    <div className="stat panel">
      <div className="s-top">
        <span className="s-lab">{label}</span>
        <span className="s-ico"><Icon size={18} /></span>
      </div>
      <div className="s-val">
        {loading ? <Skeleton w={120} h={28} /> : value}
      </div>
      {delta && !loading && (
        <div className={`s-delta ${deltaUp ? "delta-up" : "delta-dn"}`}>{delta}</div>
      )}
      {sub && !loading && (
        <div className="txt-ter" style={{ fontSize: 12, marginTop: 8 }}>{sub}</div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { address, session } = useZkLogin();
  const { price, deepPrice, change24h, isLoading: priceLoading } = usePrice();
  const { suiBalance, usdcBalance, deepBalance, vault, isLoading: walletLoading } = useWallet(address);
  const { trades, pnl, roi, count: tradeCount, isLoading: tradesLoading } = useTrades(
    vault?.id,
    deepPrice
  );

  const totalUsd = suiBalance * price + usdcBalance + deepBalance * deepPrice;
  const recent   = trades.slice(0, 6);
  const loading  = walletLoading || priceLoading;

  const budgetUsedPct = vault
    ? Math.min(100, ((vault.spent ?? 0) / (vault.budgetCap ?? 1)) * 100)
    : 0;

  return (
    <>
      <TopBar crumbs={[{ label: "Dashboard" }]}>
        <Link href="/agents/new">
          <Button variant="primary" size="sm" icon={<Plus size={16} />}>New agent</Button>
        </Link>
      </TopBar>
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Dashboard</h1>
            <div className="sub">
              {session?.name ? `Welcome back, ${session.name.split(" ")[0]}` : "Welcome back"} — live data from Sui testnet.
            </div>
          </div>
        </div>

        <div className="stat-grid rise">
          <StatCard
            label="Portfolio value"
            Icon={Wallet}
            value={usd(totalUsd, 2)}
            delta={`SUI @ ${usd(price, 3)} · ${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}% 24h`}
            deltaUp={change24h >= 0}
            loading={loading}
          />
          <StatCard
            label="SUI balance"
            Icon={TrendingUp}
            value={`${suiBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} SUI`}
            sub={`≈ ${usd(suiBalance * price, 2)}`}
            loading={loading}
          />
          <StatCard
            label="Total trades"
            Icon={Repeat}
            value={String(tradeCount)}
            sub={tradesLoading ? undefined : tradeCount === 0 ? "No trades yet" : `Last: ${trades[0]?.time ?? "—"}`}
            loading={tradesLoading}
          />
          <StatCard
            label="P&L (unrealised)"
            Icon={Bot}
            value={`${pnl >= 0 ? "+" : ""}${usd(pnl, 4)}`}
            delta={tradeCount > 0 ? `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}% ROI · ${tradeCount} trades` : undefined}
            deltaUp={pnl >= 0}
            loading={tradesLoading}
          />
        </div>

        {/* Vault state */}
        {vault && (
          <Card className="panel" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <h3>Vault · DCA agent</h3>
              <Badge status={vault.paused ? "paused" : "active"} pulse={!vault.paused}>
                {vault.paused ? "Paused" : "Running"}
              </Badge>
            </div>
            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-tertiary)" }}>
              <span>Budget used</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {(vault.spent ?? 0).toFixed(4)} / {(vault.budgetCap ?? 0).toFixed(4)} SUI
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--ink-a08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${budgetUsedPct}%`, background: "var(--orange-500)", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
          </Card>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginTop: 20 }}>
          {/* Live price card */}
          <Card className="panel">
            <div className="panel-head">
              <h3>SUI / USDC · DeepBook</h3>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                live · testnet
              </span>
            </div>
            {priceLoading ? (
              <Skeleton w="100%" h={60} />
            ) : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>
                  {usd(price, 4)}
                </span>
                <span style={{ fontSize: 15, color: change24h >= 0 ? "var(--orange-400)" : "var(--ember-500)", fontFamily: "var(--font-mono)" }}>
                  {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: 13, color: "var(--text-secondary)" }}>
              <span>Source: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>DeepBook indexer</span></span>
            </div>
          </Card>

          {/* Recent trades */}
          <Card className="panel">
            <div className="panel-head">
              <h3>Recent trades</h3>
              <Link href="/activity"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            {tradesLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3].map(i => <Skeleton key={i} w="100%" h={36} />)}
              </div>
            ) : recent.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-tertiary)", fontSize: 14 }}>
                No trades yet. Start your first agent to see live activity.
              </div>
            ) : (
              <div>
                {recent.map((tx: any, i: number) => (
                  <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < recent.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--ink-a04)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange-400)", flexShrink: 0 }}>
                      <ArrowDownLeft size={15} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        Bought {tx.baseReceived.toFixed(4)} DEEP
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{tx.time}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{usd(tx.quoteSpent, 4)}</div>
                      <a href={tx.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "var(--text-disabled)" }}>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
