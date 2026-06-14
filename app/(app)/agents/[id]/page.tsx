"use client";
import { useParams, useRouter } from "next/navigation";
import { Bot, ArrowDownLeft, ArrowUpRight, OctagonX, Pause, Play } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AGENTS, TRANSACTIONS, usd, signedUsd, pct } from "@/lib/data";

export default function AgentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const agent = AGENTS.find((a) => a.id === id) || AGENTS[0];
  const txs = TRANSACTIONS.filter((t) => t.agent === agent.name).slice(0, 8);

  return (
    <>
      <TopBar crumbs={[{ label: "My agents", path: "/agents" }, { label: agent.name }]}>
        {agent.status === "active" ? (
          <>
            <Button variant="secondary" size="sm" icon={<Pause size={15} />}>Pause</Button>
            <Button variant="danger" size="sm" icon={<OctagonX size={15} />}>Revoke</Button>
          </>
        ) : agent.status === "paused" ? (
          <Button variant="primary" size="sm" icon={<Play size={15} />}>Resume</Button>
        ) : null}
      </TopBar>
      <div className="page">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--brand-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange-400)" }}>
            <Bot size={26} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{agent.name}</h1>
              <Badge status={agent.status as "active" | "paused" | "revoked"} pulse={agent.status === "active"}>
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </Badge>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{agent.strategy} · {agent.trades} trades</div>
          </div>
        </div>

        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "P&L", value: signedUsd(agent.pnl), color: agent.pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" },
            { label: "Return", value: pct(agent.pnlPct), color: agent.pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" },
            { label: "Volume", value: usd(agent.volume, 0), color: undefined },
            { label: "Success rate", value: agent.successRate + "%", color: undefined },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat panel">
              <div className="s-top"><span className="s-lab">{label}</span></div>
              <div className="s-val" style={color ? { color } : {}}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          <Card className="panel">
            <div className="panel-head"><h3>Budget</h3></div>
            <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)" }}>
              <span>{usd(agent.spent)} spent</span>
              <span>{usd(agent.budget)} budget</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(agent.spent / agent.budget) * 100}%` }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 8 }}>
              {usd(agent.budget - agent.spent)} remaining ({(100 - (agent.spent / agent.budget) * 100).toFixed(1)}%)
            </div>
          </Card>

          <Card className="panel">
            <div className="panel-head"><h3>Details</h3></div>
            <div className="dl">
              {[
                ["ID", agent.id],
                ["Strategy", agent.strategy],
                ["Status", agent.status],
                ["Trades", String(agent.trades)],
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
                <tr>{["Type", "Asset", "Amount", "Value", "Status", "Time"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(txs.length ? txs : TRANSACTIONS.slice(0, 5)).map((tx, i) => (
                  <tr key={i}>
                    <td><span className={`tag ${tx.type === "buy" ? "tag-buy" : "tag-sell"}`}>{tx.type === "buy" ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}{tx.type}</span></td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{tx.asset}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{tx.amount}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{usd(tx.usd)}</td>
                    <td><span className={`tag ${tx.status === "confirmed" ? "tag-ok" : tx.status === "pending" ? "tag-pending" : "tag-fail"}`}>{tx.status}</span></td>
                    <td style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{tx.time}</td>
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
