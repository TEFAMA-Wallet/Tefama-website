"use client";
import Link from "next/link";
import { Fingerprint, Bot, FileLock2, Activity, Gauge, ShieldCheck, Boxes, ListChecks, OctagonX, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

const STEPS = [
  { Icon: Fingerprint, h: "Connect your wallet", b: "Sign in with Google or Apple via zkLogin. No passwords, no seed phrases, no wallet app needed." },
  { Icon: Bot, h: "Create an agent", b: "Choose a template (Buy-the-dip, DCA, Grid trading) or build custom. Set budget, time window, and protocol scope." },
  { Icon: FileLock2, h: "Deploy a Move policy", b: "TEFAMA deploys a Move policy object to Sui that encodes your agent's authority — budget, scope, and time." },
  { Icon: Activity, h: "Agent trades autonomously", b: "The agent monitors the market and executes within its policy limits. No signatures required, ever." },
  { Icon: Gauge, h: "Monitor & control", b: "Watch executions in real time, check portfolio metrics, and revoke any agent in a single transaction." },
];

const DEEP = [
  { Icon: ShieldCheck, h: "How budget enforcement works", b: "Each agent is bound to a Move policy object that carries its budget. Every trade is checked against that ceiling by the Sui VM. If an agent with a $500 budget tries to execute a $600 trade, the transaction is rejected on-chain — the ceiling cannot be exceeded, even by a misbehaving agent." },
  { Icon: Boxes, h: "Why Sui?", b: "Move was designed for asset safety, making whole classes of exploits impossible. Programmable transaction blocks let an agent compose multi-step trades atomically, Deepbook provides a native on-chain order book, and zkLogin removes the seed-phrase barrier entirely." },
  { Icon: ListChecks, h: "Activity-log transparency", b: "Every execution emits a Sui event — an immutable, timestamped record. The in-app activity log mirrors what's on-chain, and every row links to Sui Explorer so you can verify it yourself." },
  { Icon: OctagonX, h: "The revocation mechanism", b: "Revocation is a single on-chain transaction that invalidates the agent's policy object. The instant it confirms, the agent can no longer execute, and its remaining budget returns to your wallet." },
];

export default function HowItWorksPage() {
  return (
    <div className="pub">
      <PublicHeader />
      <main className="pub-main">
        <section className="section" style={{ paddingBottom: 50 }}>
          <div className="container">
            <div className="section-head">
              <div className="kicker">How it works</div>
              <h2 style={{ fontSize: 44 }}>How TEFAMA works</h2>
              <p>From wallet connection to autonomous trading in minutes.</p>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="hiw-steps">
              {STEPS.map((s, i) => (
                <Card key={i} className="hiw-step-card">
                  <div className="hiw-step-num">0{i + 1}</div>
                  <div className="hiw-step-ico"><s.Icon size={22} /></div>
                  <h3 className="hiw-step-title">{s.h}</h3>
                  <p className="hiw-step-body">{s.b}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: 32 }}>
              <div className="kicker">Under the hood</div>
              <h2>The technical details</h2>
              <p>How TEFAMA keeps your funds safe while staying fully autonomous.</p>
            </div>
            <div className="grid-2">
              {DEEP.map((d) => (
                <Card key={d.h} style={{ padding: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div className="feature-ico" style={{ margin: 0 }}><d.Icon size={20} /></div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{d.h}</h3>
                  </div>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 14 }}>{d.b}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="cta-band">
              <h2>See it in action</h2>
              <p>Connect your wallet and launch your first agent in 60 seconds.</p>
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
