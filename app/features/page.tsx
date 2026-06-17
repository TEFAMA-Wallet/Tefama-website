"use client";
import Link from "next/link";
import { LayoutGrid, Gauge, TrendingUp, Radio, ListChecks, OctagonX, Bell, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

const FEATURES = [
  { Icon: LayoutGrid, h: "Agent templates", b: "Choose from pre-built templates — Buy-the-dip, DCA, Grid trading — or compose a custom strategy. Each template ships with sensible defaults you can tune before deploying." },
  { Icon: Gauge, h: "Risk assessment scoring", b: "Get a Low / Medium / High risk score before you deploy, with a breakdown of the factors driving it. Know exactly what you're risking." },
  { Icon: TrendingUp, h: "Portfolio performance dashboard", b: "Track portfolio ROI, agent performance, daily returns, and risk metrics in one place. Drill into any agent's contribution." },
  { Icon: Radio, h: "Real-time monitoring", b: "Watch agents execute trades live over WebSocket. The activity feed updates the instant a trade lands on-chain." },
  { Icon: ListChecks, h: "On-chain activity log", b: "Every action is logged on Sui — a transparent, immutable audit trail you can verify on Sui Explorer at any time." },
  { Icon: OctagonX, h: "Instant revocation", b: "Stop any agent immediately with one click. The on-chain policy is invalidated instantly, and remaining budget returns to your wallet." },
  { Icon: Bell, h: "Smart alerts", b: "Get notified when budget thresholds are hit, agents are revoked, or performance falls below your targets." },
  { Icon: Wallet, h: "Multi-token wallet", b: "View your full Sui portfolio — SUI, USDC, DEEP, and any other token — in one unified view with real-time prices." },
];

export default function FeaturesPage() {
  return (
    <div className="pub">
      <PublicHeader />
      <main className="pub-main">
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="section-head">
              <div className="kicker">Features</div>
              <h2 style={{ fontSize: 44 }}>Everything you need to automate</h2>
              <p>From strategy selection to real-time monitoring — all in one place.</p>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="grid-4">
              {FEATURES.map((f) => (
                <Card key={f.h} className="feature-card" style={{ padding: 28 }}>
                  <div className="feature-ico"><f.Icon size={22} /></div>
                  <h3 style={{ fontSize: 16, marginBottom: 8 }}>{f.h}</h3>
                  <p style={{ lineHeight: 1.65, fontSize: 14 }}>{f.b}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="section-sm">
          <div className="container">
            <div className="cta-band">
              <h2>Ready to try it?</h2>
              <p>Connect your wallet and deploy your first agent in under a minute.</p>
              <div className="hero-cta">
                <Link href="/connect">
                  <Button variant="primary" size="lg" icon={<Wallet size={20} />}>Start free</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
