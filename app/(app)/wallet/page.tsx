"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet } from "@/hooks/useOnchain";
import { usd } from "@/lib/data";

function Skeleton({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 6,
      background: "var(--ink-a08)",
      animation: "tefama-pulse 1.6s ease-in-out infinite",
    }} />
  );
}

export default function WalletPage() {
  const { address } = useZkLogin();
  const { price, deepPrice, isLoading: priceLoading } = usePrice();
  const { suiBalance, usdcBalance, deepBalance, isLoading } = useWallet(address);
  const [copied, setCopied] = useState(false);

  const totalUsd = suiBalance * price + usdcBalance + deepBalance * deepPrice;

  const tokens = [
    { sym: "SUI",  name: "Sui",           balance: suiBalance,  price,      usd_: suiBalance * price,      decimals: 4 },
    { sym: "USDC", name: "USD Coin",       balance: usdcBalance, price: 1,   usd_: usdcBalance,             decimals: 2 },
    { sym: "DEEP", name: "DeepBook Token", balance: deepBalance, price: deepPrice, usd_: deepBalance * deepPrice, decimals: 4 },
  ];
  const totalNonZero = tokens.filter(t => t.usd_ > 0).reduce((s, t) => s + t.usd_, 0) || 1;

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  };

  const shortAddr = address
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : "—";

  return (
    <>
      <TopBar crumbs={[{ label: "Wallet" }]} />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Wallet</h1>
            <div className="sub">Your Sui wallet · zkLogin · Testnet</div>
          </div>
        </div>

        <Card variant="raised" style={{ padding: 28, marginBottom: 20 }} className="rise">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                Total balance
              </div>
              {isLoading || priceLoading ? (
                <Skeleton w={180} h={42} />
              ) : (
                <>
                  <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "var(--font-mono)" }}>
                    {usd(totalUsd, 2)}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                    SUI @ {usd(price, 4)} · DEEP @ {usd(deepPrice, 4)} · DeepBook live
                  </div>
                </>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8 }}>zkLogin · Google</div>
              <button onClick={copy} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--ink-a06)", border: "1px solid var(--border-default)",
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: "var(--text-secondary)", fontSize: 12, fontFamily: "var(--font-mono)",
              }}>
                {shortAddr}
                {copied ? <Check size={12} style={{ color: "var(--orange-400)" }} /> : <Copy size={12} />}
              </button>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange-500)", display: "inline-block" }} />
                Sui Testnet
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
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5].map(j => (
                        <td key={j}><Skeleton w={60} h={16} /></td>
                      ))}
                    </tr>
                  ))
                ) : (
                  tokens.map((t) => {
                    const alloc = totalNonZero > 0 ? Math.round((t.usd_ / totalNonZero) * 100) : 0;
                    return (
                      <tr key={t.sym}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{t.sym}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.name}</div>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>
                          {t.balance.toLocaleString(undefined, { maximumFractionDigits: t.decimals })}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {t.price ? usd(t.price, t.sym === "SUI" ? 4 : 2) : "—"}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          {t.usd_ > 0 ? usd(t.usd_, 2) : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, height: 6, background: "var(--ink-a08)", borderRadius: 3, overflow: "hidden", maxWidth: 100 }}>
                              <div style={{ height: "100%", width: `${alloc}%`, background: "var(--orange-500)", borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{alloc}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-tertiary)", textAlign: "center" }}>
          Balances fetched live from Sui testnet · refreshes every 15s
        </div>
      </div>
    </>
  );
}
