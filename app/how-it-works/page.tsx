import Link from "next/link";
import { Fingerprint, Bot, FileLock2, Activity, Gauge, ShieldCheck, Boxes, ListChecks, OctagonX, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

const STEPS = [
  {
    Icon: Fingerprint,
    h: "Sign in with Google",
    b: "TEFAMA uses Sui zkLogin — your Google account is all you need. A Sui wallet address is derived automatically via a zero-knowledge proof. No seed phrase, no browser extension, no separate wallet app.",
  },
  {
    Icon: Bot,
    h: "Choose a strategy & budget",
    b: "Pick from DCA, Buy-the-Dip, Grid Trading, or Momentum. Set your SUI budget and how long the agent should run. A risk score (Low / Medium / High) is shown before you deploy.",
  },
  {
    Icon: FileLock2,
    h: "Vault locks your rules on-chain",
    b: "Your budget cap lives in a Move smart contract — the vault — on Sui. The agent is added to the vault allowlist and can only spend what the contract permits. The Sui VM enforces this; TEFAMA's servers cannot override it.",
  },
  {
    Icon: Activity,
    h: "Agent trades on DeepBook — every hour",
    b: "The agent runs via Vercel cron every hour. It checks the DEEP/SUI price on DeepBook v3. If the price is within 5% of the 24-hour low, it places a real market order through a BalanceManager. No manual signature needed.",
  },
  {
    Icon: Gauge,
    h: "Monitor, pause, or revoke anytime",
    b: "Your activity feed shows every on-chain trade — DEEP received, SUI spent, execution price — with a direct Sui Explorer link. Pause or fully revoke the agent from Vault settings at any time with one click.",
  },
];

const DEEP = [
  {
    Icon: ShieldCheck,
    h: "How budget enforcement works",
    b: "The vault contract uses a hot-potato pattern: request_trade() issues a TradeReceipt that must be consumed by settle_trade() in the same programmable transaction block. The contract debits the budget atomically before the trade and reverts the whole PTB if the cap would be exceeded — making overspend impossible at the VM level.",
  },
  {
    Icon: Boxes,
    h: "Why Sui & Move?",
    b: "Move's ownership model makes whole classes of exploits impossible. Programmable transaction blocks let the agent compose deposit → place order → withdraw → settle atomically. DeepBook v3 is a native central-limit order book — real fills, not simulated swaps. zkLogin removes the seed-phrase barrier so anyone can sign in with Google.",
  },
  {
    Icon: ListChecks,
    h: "Activity-log transparency",
    b: "Every trade emits TradeSettled and Charged events on Sui — immutable, timestamped, and publicly verifiable. The in-app activity log reads these events directly and every row links to Sui Explorer so you can confirm the trade happened on-chain.",
  },
  {
    Icon: OctagonX,
    h: "Pause and revocation",
    b: "Pausing calls set_paused(true) on the vault — a single on-chain transaction. The agent checks this flag before every trade and skips if paused. Revoking calls remove_agent(), permanently removing the agent from the allowlist. In both cases your vault balance stays in the contract under your ownership.",
  },
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
              <p>From Google sign-in to autonomous on-chain trading in under a minute.</p>
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
              <p>Sign in with Google and your agent is live in under a minute.</p>
              <div className="hero-cta">
                <Link href="/connect">
                  <Button variant="primary" size="lg" icon={<Wallet size={20} />}>Get started</Button>
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
