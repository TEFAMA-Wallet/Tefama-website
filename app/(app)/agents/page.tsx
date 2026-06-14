"use client";
import Link from "next/link";
import { useState } from "react";
import { Bot, Plus, TrendingUp, TrendingDown } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AGENTS, usd, signedUsd, pct } from "@/lib/data";

export default function AgentsPage() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Active", "Paused", "Revoked"];
  const filtered = filter === "All" ? AGENTS : AGENTS.filter((a) => a.status === filter.toLowerCase());

  return (
    <>
      <TopBar crumbs={[{ label: "My agents" }]}>
        <Link href="/agents/new">
          <Button variant="primary" size="sm" icon={<Plus size={16} />}>New agent</Button>
        </Link>
      </TopBar>
      <div className="page">
        <div className="page-head">
          <div>
            <h1>My agents</h1>
            <div className="sub">{AGENTS.filter((a) => a.status === "active").length} active · {AGENTS.length} total</div>
          </div>
          <div className="seg">
            {filters.map((f) => (
              <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map((a) => (
            <Link key={a.id} href={`/agents/${a.id}`} style={{ textDecoration: "none" }}>
              <div className="agent-card">
                <div className="a-head">
                  <div className="a-ic"><Bot size={20} /></div>
                  <div style={{ flex: 1 }}>
                    <div className="a-name">{a.name}</div>
                    <div className="a-strat">{a.strategy}</div>
                  </div>
                  <Badge status={a.status as "active" | "paused" | "revoked"} pulse={a.status === "active"}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </Badge>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>
                    <span>Budget used</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{usd(a.spent)} / {usd(a.budget)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(a.spent / a.budget) * 100}%` }} />
                  </div>
                </div>
                <div className="a-meta">
                  <div className="am-item">
                    <div className="l">P&L</div>
                    <div className="v" style={{ color: a.pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {signedUsd(a.pnl)}
                    </div>
                  </div>
                  <div className="am-item">
                    <div className="l">Return</div>
                    <div className="v" style={{ color: a.pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {pct(a.pnlPct)}
                    </div>
                  </div>
                  <div className="am-item">
                    <div className="l">Trades</div>
                    <div className="v">{a.trades}</div>
                  </div>
                  <div className="am-item">
                    <div className="l">Success</div>
                    <div className="v">{a.successRate}%</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
