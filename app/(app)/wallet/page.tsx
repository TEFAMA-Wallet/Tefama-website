"use client";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { WALLET, TOKENS, usd } from "@/lib/data";

export default function WalletPage() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(WALLET.fullAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  };

  return (
    <>
      <TopBar crumbs={[{ label: "Wallet" }]} />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Wallet</h1>
            <div className="sub">Your Sui wallet balance and holdings.</div>
          </div>
        </div>

        <Card variant="raised" style={{ padding: 28, marginBottom: 20 }} className="rise">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                Total balance
              </div>
              <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "var(--font-mono)" }}>
                {usd(WALLET.totalUsd, 0)}
              </div>
              <div style={{ fontSize: 14, color: "var(--orange-400)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                +{usd(WALLET.delta24hUsd)} (+{WALLET.delta24hPct}%) 24h
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8 }}>{WALLET.type}</div>
              <button onClick={copy} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--white-a06)", border: "1px solid var(--border-default)",
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: "var(--text-secondary)", fontSize: 12, fontFamily: "var(--font-mono)",
              }}>
                {WALLET.fullAddress}
                {copied ? <Check size={12} style={{ color: "var(--orange-400)" }} /> : <Copy size={12} />}
              </button>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange-500)", display: "inline-block", marginRight: 6 }} />
                {WALLET.network}
              </div>
            </div>
          </div>
        </Card>

        <Card className="panel">
          <div className="panel-head"><h3>Holdings</h3></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>{["Token", "Balance", "Price", "Value", "Allocation"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {TOKENS.map((t) => (
                  <tr key={t.sym}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.sym}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.name}</div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{t.balance.toLocaleString()}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                      {t.price ? usd(t.price, 3) : "—"}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{usd(t.usd, 0)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: "var(--white-a08)", borderRadius: 3, overflow: "hidden", maxWidth: 100 }}>
                          <div style={{ height: "100%", width: `${t.alloc}%`, background: "var(--orange-500)", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{t.alloc}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button variant="secondary">Send</Button>
          <Button variant="secondary">Receive</Button>
          <Button variant="secondary">Swap</Button>
        </div>
      </div>
    </>
  );
}
