"use client";
import { TrendingUp, Target, Gauge, Download } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useZkLogin } from "@/context/ZkLoginContext";
import { usePrice, useWallet, useTrades } from "@/hooks/useOnchain";
import { usd } from "@/lib/data";

function Skel({ w = 80 }: { w?: number }) {
  return <div style={{ width: w, height: 22, borderRadius: 5, background: "var(--ink-a08)", animation: "tefama-pulse 1.6s ease-in-out infinite", display: "inline-block" }} />;
}

function StatCard({ label, Icon, value, sub, loading }: {
  label: string; Icon: React.ElementType; value: string; sub?: string; loading?: boolean;
}) {
  return (
    <div className="stat panel">
      <div className="s-top"><span className="s-lab">{label}</span><span className="s-ico"><Icon size={18} /></span></div>
      <div className="s-val">{loading ? <Skel /> : value}</div>
      {sub && <div className="txt-ter" style={{ fontSize: 12, marginTop: 8 }}>{loading ? <Skel w={120} /> : sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { address } = useZkLogin();
  const { price, change24h, high24h, low24h, volume24h, isLoading: priceLoading } = usePrice();
  const { vault, suiBalance, usdcBalance, isLoading: walletLoading } = useWallet(address);
  const { trades, pnl, roi, count, isLoading: tradesLoading } = useTrades(vault?.id, price);

  const isLoading = priceLoading || walletLoading || tradesLoading;
  const totalValue = suiBalance * price + usdcBalance;
  const spent      = vault?.spent ?? 0;

  const avgBuyPrice = count > 0
    ? trades.reduce((s: number, t: any) => s + t.quoteSpent, 0) / trades.reduce((s: number, t: any) => s + t.baseReceived, 0)
    : 0;

  return (
    <>
      <TopBar crumbs={[{ label: "Dashboard", path: "/dashboard" }, { label: "Portfolio" }]}>
        <Button variant="secondary" size="sm" icon={<Download size={15} />} onClick={() => {}}>Export report</Button>
      </TopBar>
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Portfolio analytics</h1>
            <div className="sub">Performance and risk · Sui testnet · live from DeepBook</div>
          </div>
        </div>

        <div className="stat-grid rise">
          <StatCard
            label="P&L"
            Icon={TrendingUp}
            value={(pnl >= 0 ? "+" : "") + usd(pnl, 4)}
            sub={`${roi >= 0 ? "+" : ""}${roi.toFixed(2)}% ROI`}
            loading={isLoading}
          />
          <StatCard
            label="Total executions"
            Icon={Target}
            value={String(count)}
            sub={count > 0 ? `${usd(spent)} total volume` : "No trades yet"}
            loading={isLoading}
          />
          <StatCard
            label="SUI price"
            Icon={Gauge}
            value={usd(price, 4)}
            sub={`${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}% 24 h`}
            loading={priceLoading}
          />
          <StatCard
            label="Portfolio value"
            Icon={TrendingUp}
            value={usd(totalValue, 2)}
            sub={`${suiBalance.toFixed(4)} SUI + ${usdcBalance.toFixed(2)} USDC`}
            loading={isLoading}
          />
        </div>

        <Card className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head"><h3>24 h market — SUI / USDC (DeepBook)</h3></div>
          <div className="mini-row">
            {[
              { l: "Price",    v: usd(price, 4) },
              { l: "24h High", v: usd(high24h, 4) },
              { l: "24h Low",  v: usd(low24h, 4) },
              { l: "Volume",   v: usd(volume24h, 0) },
            ].map(({ l, v }) => (
              <div key={l} className="mini">
                <div className="l">{l}</div>
                <div className="v">{priceLoading ? <Skel /> : v}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head"><h3>Agent performance</h3></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>{["Agent", "Strategy", "Volume", "Trades", "Avg buy price", "P&L", "ROI"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>{[1,2,3,4,5,6,7].map(i => <td key={i}><Skel /></td>)}</tr>
                ) : (
                  <tr>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--orange-400)", flexShrink: 0 }} />
                        TEFAMA DCA Agent
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>DCA</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{usd(spent)}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{count}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                      {avgBuyPrice > 0 ? usd(avgBuyPrice, 4) : "—"}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: pnl >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {(pnl >= 0 ? "+" : "") + usd(pnl, 4)}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: roi >= 0 ? "var(--orange-400)" : "var(--ember-500)" }}>
                      {(roi >= 0 ? "+" : "") + roi.toFixed(2)}%
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
