import Link from "next/link";
import {
  Fingerprint, ShieldCheck, TrendingUp, BookOpen,
  Bell, Wallet, Pause, BarChart3, ClipboardList,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

const FEATURES = [
  {
    Icon: Fingerprint,
    h: "No wallet required — just Google",
    b: "Sign in with your Google account. Your Sui wallet address is derived automatically via zkLogin — a zero-knowledge proof that never exposes your private key. No browser extension, no seed phrase, no setup.",
  },
  {
    Icon: ShieldCheck,
    h: "On-chain budget enforcement",
    b: "Your spending cap lives in a Move smart contract on Sui, not on our servers. The agent physically cannot trade beyond the SUI amount you set — the contract rejects any transaction that would exceed it.",
  },
  {
    Icon: BookOpen,
    h: "Real DeepBook v3 order book trades",
    b: "Every trade is a real market order placed against the DEEP/SUI order book on DeepBook v3 via a BalanceManager. These are confirmed on-chain fills — not simulated swaps.",
  },
  {
    Icon: TrendingUp,
    h: "DCA strategy — automatic and hourly",
    b: "The agent runs every hour. It checks if the DEEP price is within 5% of the 24-hour low, and if so, places a buy. Dollar-cost averaging removes the guesswork from timing the market.",
  },
  {
    Icon: BarChart3,
    h: "Live portfolio & performance dashboard",
    b: "Track your SUI, USDC, and DEEP balances with live prices from DeepBook. See your DCA agent's total DEEP accumulated, average buy price, and unrealised P&L — all updated in real time.",
  },
  {
    Icon: ClipboardList,
    h: "On-chain activity log",
    b: "Every trade the agent executes appears in your activity feed with the exact amount of DEEP received, SUI spent, execution price, and a direct link to verify the transaction on Sui Explorer.",
  },
  {
    Icon: Pause,
    h: "Pause or revoke at any time",
    b: "From Vault settings you can pause the agent — halting all new trades immediately — or fully revoke it, removing it from the on-chain allowlist permanently. You stay in control, always.",
  },
  {
    Icon: Bell,
    h: "Real notifications — nothing fake",
    b: "Get notified when the agent executes a trade, when your budget reaches 80% or is fully exhausted, and when the agent is paused or resumed. Toggle each type independently in Settings.",
  },
  {
    Icon: Wallet,
    h: "Mobile companion app",
    b: "The TEFAMA mobile app (Android APK + iOS) connects to the same on-chain data. Log in with the same Google account and your vault, trades, and balances appear instantly — no extra setup.",
  },
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
              <h2 style={{ fontSize: 44 }}>What TEFAMA actually does</h2>
              <p>Every feature below is live and working on Sui Testnet — nothing is mocked or coming soon.</p>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="grid-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
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
              <p>Sign in with Google and your agent is live in under a minute.</p>
              <div className="hero-cta">
                <Link href="/connect">
                  <Button variant="primary" size="lg" icon={<Fingerprint size={20} />}>Get started</Button>
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
