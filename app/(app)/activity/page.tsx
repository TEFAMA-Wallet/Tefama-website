"use client";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import { TRANSACTIONS, AGENTS, usd } from "@/lib/data";

const ALL_TXS = [...TRANSACTIONS, ...TRANSACTIONS.map((t, i) => ({ ...t, id: t.id + "_2", time: `${i + 6}h ago` }))];

export default function ActivityPage() {
  const [filter, setFilter] = useState("All");
  const agentNames = ["All", ...Array.from(new Set(TRANSACTIONS.map((t) => t.agent)))];
  const filtered = filter === "All" ? ALL_TXS : ALL_TXS.filter((t) => t.agent === filter);

  return (
    <>
      <TopBar crumbs={[{ label: "Dashboard", path: "/dashboard" }, { label: "Activity" }]} />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Activity log</h1>
            <div className="sub">All on-chain executions across your agents.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {agentNames.map((n) => (
            <button key={n} onClick={() => setFilter(n)} style={{
              padding: "6px 14px", borderRadius: 20,
              background: filter === n ? "var(--brand-tint)" : "var(--white-a06)",
              border: `1px solid ${filter === n ? "var(--orange-a20)" : "var(--border-subtle)"}`,
              color: filter === n ? "var(--orange-400)" : "var(--text-secondary)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>{n}</button>
          ))}
        </div>

        <Card className="panel">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>{["Type", "Asset", "Amount", "Value", "Agent", "Status", "Time", ""].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className={`tag ${tx.type === "buy" ? "tag-buy" : "tag-sell"}`}>
                        {tx.type === "buy" ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{tx.asset}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{tx.amount}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{usd(tx.usd)}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{tx.agent}</td>
                    <td>
                      <span className={`tag ${tx.status === "confirmed" ? "tag-ok" : tx.status === "pending" ? "tag-pending" : "tag-fail"}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{tx.time}</td>
                    <td>
                      <button style={{ background: "none", border: "none", color: "var(--text-disabled)", cursor: "pointer", padding: 4 }}>
                        <ExternalLink size={13} />
                      </button>
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
