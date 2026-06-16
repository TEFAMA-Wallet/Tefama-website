"use client";
import { useState } from "react";
import Link from "next/link";
import { Wallet, Bot, Repeat, CircleCheckBig, Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AreaChart from "@/components/charts/AreaChart";
import Sparkline from "@/components/charts/Sparkline";
import { AGENTS, TRANSACTIONS, PORTFOLIO_SERIES, usd, signedUsd, pct } from "@/lib/data";

const SPARK = [40, 44, 38, 47, 51, 48, 55, 60, 58, 63, 67, 71, 69, 74, 78, 75, 80, 82, 79, 85];

function StatCard({ label, Icon, value, delta, deltaUp, sub, spark }: {
  label: string; Icon: React.ElementType; value: string; delta?: string; deltaUp?: boolean; sub?: string; spark?: boolean;
}) {
  return (
    <div className="stat panel">
      <div className="s-top">
        <span className="s-lab">{label}</span>
        <span className="s-ico"><Icon size={18} /></span>
      </div>
      <div className="s-val">{value}</div>
      {delta && <div className={`s-delta ${deltaUp ? "delta-up" : "delta-dn"}`}>{delta}</div>}
      {sub && <div className="txt-ter" style={{ fontSize: 12, marginTop: 8 }}>{sub}</div>}
      {spark && <div style={{ marginTop: 12 }}><Sparkline data={SPARK} width={200} height={36} /></div>}
    </div>
  );
}

export default function DashboardPage() {
  const [tf, setTf] = useState("7d");
  const active = AGENTS.filter((a) => a.status === "active");
  const recent = TRANSACTIONS.slice(0, 6);

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
            <div className="sub">Welcome back — here&apos;s how your agents are doing.</div>
          </div>
        </div>

        <div className="stat-grid rise">
          <StatCard label="Portfolio value" Icon={Wallet} value={usd(45250, 0)} delta="+$2,450 · +5.7% (24h)" deltaUp spark />
          <StatCard label="Active agents" Icon={Bot} value={String(active.length)} sub="5 profitable · 1 neutral · 1 negative" />
          <StatCard label="Volume (24h)" Icon={Repeat} value={usd(125430, 0)} delta="+$15,200 vs yesterday" deltaUp />
          <StatCard label="Success rate" Icon={CircleCheckBig} value="94.2%" sub="2,847 trades · 2,682 successful" />
        </div>

        <Card className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <h3>Portfolio performance</h3>
            <div className="seg">
              {["24h", "7d", "30d", "All"].map((t) => (
                <button key={t} className={tf === t ? "on" : ""} onClick={() => setTf(t)}>{t}</button>
              ))}
            </div>
          </div>
          <AreaChart data={PORTFOLIO_SERIES} height={280} />
          <div className="mini-row">
            <div className="mini"><div className="l">Starting</div><div className="v">{usd(39800, 0)}</div></div>
            <div className="mini"><div className="l">Current</div><div className="v txt-brand">{usd(45250, 0)}</div></div>
            <div className="mini"><div className="l">Peak</div><div className="v">{usd(45610, 0)}</div></div>
            <div className="mini"><div className="l">Change</div><div className="v delta-up">+{usd(5450, 0)}</div></div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginTop: 20 }}>
          <Card className="panel">
            <div className="panel-head">
              <h3>Active agents</h3>
              <Link href="/agents"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {AGENTS.filter((a) => a.status === "active").slice(0, 4).map((a) => (
                <Link key={a.id} href={`/agents/${a.id}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", borderRadius: 10, background: "var(--ink-a04)", transition: "background 0.15s" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange-400)", flexShrink: 0 }}>
                    <Bot size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.strategy}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: a.pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {signedUsd(a.pnl)}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-tertiary)" }}>{pct(a.pnlPct)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="panel">
            <div className="panel-head">
              <h3>Recent trades</h3>
              <Link href="/activity"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div>
              {recent.map((tx, i) => (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < recent.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--ink-a04)", display: "flex", alignItems: "center", justifyContent: "center", color: tx.type === "buy" ? "var(--orange-400)" : "var(--text-secondary)", flexShrink: 0 }}>
                    {tx.type === "buy" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.type === "buy" ? "Bought" : "Sold"} {tx.amount} {tx.asset}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{tx.time}</div>
                  </div>
                  <Badge status={tx.status === "confirmed" ? "active" : "pending"}>
                    {tx.status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
