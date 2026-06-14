"use client";
import { useState } from "react";
import { TrendingUp, Target, Gauge, TrendingDown, Download } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AreaChart from "@/components/charts/AreaChart";
import { AGENTS, PORTFOLIO_SERIES, usd, signedUsd, pct } from "@/lib/data";

const DONUT_COLORS = ["#FF8C00", "#FFA333", "#FFB347", "#FFC266", "#FFD280"];

function StatCard({ label, Icon, value, delta, deltaUp, sub }: {
  label: string; Icon: React.ElementType; value: string; delta?: string; deltaUp?: boolean; sub?: string;
}) {
  return (
    <div className="stat panel">
      <div className="s-top"><span className="s-lab">{label}</span><span className="s-ico"><Icon size={18} /></span></div>
      <div className="s-val">{value}</div>
      {delta && <div className={`s-delta ${deltaUp ? "delta-up" : "delta-dn"}`}>{delta}</div>}
      {sub && <div className="txt-ter" style={{ fontSize: 12, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [tf, setTf] = useState("30d");
  const activeAgents = AGENTS.filter((a) => a.status !== "revoked");
  const totalVol = activeAgents.reduce((s, a) => s + a.volume, 0);

  return (
    <>
      <TopBar crumbs={[{ label: "Dashboard", path: "/dashboard" }, { label: "Portfolio" }]}>
        <Button variant="secondary" size="sm" icon={<Download size={15} />}>Export report</Button>
      </TopBar>
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Portfolio analytics</h1>
            <div className="sub">Performance and risk across all agents.</div>
          </div>
          <div className="seg">
            {["24h", "7d", "30d", "All"].map((t) => (
              <button key={t} className={tf === t ? "on" : ""} onClick={() => setTf(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="stat-grid rise">
          <StatCard label="Total return" Icon={TrendingUp} value="+$5,240" delta="+10.48%" deltaUp />
          <StatCard label="Win rate" Icon={Target} value="94.2%" sub="2,682 of 2,847 trades" />
          <StatCard label="Sharpe ratio" Icon={Gauge} value="2.14" sub="Risk-adjusted return" />
          <StatCard label="Max drawdown" Icon={TrendingDown} value="−8.2%" delta="Recovered" />
        </div>

        <Card className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head"><h3>Portfolio value over time</h3></div>
          <AreaChart data={PORTFOLIO_SERIES} height={320} />
          <div className="mini-row">
            <div className="mini"><div className="l">Starting</div><div className="v">{usd(39800, 0)}</div></div>
            <div className="mini"><div className="l">Current</div><div className="v txt-brand">{usd(45250, 0)}</div></div>
            <div className="mini"><div className="l">Peak</div><div className="v">{usd(45610, 0)}</div></div>
            <div className="mini"><div className="l">Low</div><div className="v">{usd(39210, 0)}</div></div>
          </div>
        </Card>

        <Card className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head"><h3>Agent contribution</h3></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>{["Agent", "Strategy", "Volume", "P&L", "Return", "Status"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {activeAgents.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: DONUT_COLORS[i] || "#8a8a8a", flexShrink: 0 }} />
                        {a.name}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{a.strategy}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{usd(a.volume, 0)}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: a.pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {signedUsd(a.pnl)}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: a.pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {pct(a.pnlPct)}
                    </td>
                    <td>
                      <span className={`badge badge-${a.status}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
