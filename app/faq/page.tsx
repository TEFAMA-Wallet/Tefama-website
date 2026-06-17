"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

const FAQ_ALL = [
  {
    category: "Getting started",
    items: [
      { q: "Is TEFAMA free to use?", a: "Yes — the core features are free forever. No credit card required. We offer a Pro plan for power users who want higher budgets, more agents, and advanced analytics." },
      { q: "Does TEFAMA ever touch my private keys?", a: "Never. We use zkLogin, which means you sign in with Google and your keys stay on your device. TEFAMA receives a scoped delegation — it can trade within your limits, and nothing else." },
      { q: "Do I need a wallet app?", a: "No. zkLogin lets you sign in with Google or Apple. TEFAMA creates a Sui wallet automatically and manages it for you — no seed phrases, no extensions." },
    ],
  },
  {
    category: "Agents & trading",
    items: [
      { q: "What happens if an agent loses money?", a: "The agent can only spend its budget. If the budget runs out, the agent stops automatically. You can also revoke any agent at any time with a single tap." },
      { q: "Can I run multiple agents at once?", a: "Yes. On the free plan you can run up to 3 agents simultaneously. Pro unlocks unlimited agents with higher per-agent budgets." },
      { q: "Which protocols does TEFAMA support?", a: "We currently support Deepbook (native Sui order book) for spot trading. Cetus, Turbos, and more are coming soon." },
      { q: "Can I create a custom strategy?", a: "Yes. In addition to the pre-built templates (Buy-the-dip, DCA, Grid trading), you can compose a custom strategy by setting your own parameters." },
    ],
  },
  {
    category: "Security",
    items: [
      { q: "How are budget limits enforced?", a: "Budget limits are encoded in a Move policy object on Sui. Every transaction is verified by the Sui VM against those limits — they cannot be exceeded, even if the agent is compromised." },
      { q: "How do I revoke an agent?", a: "One click in the dashboard sends a single on-chain transaction that invalidates the agent's policy. The instant it confirms, the agent is stopped and remaining budget returns to your wallet." },
      { q: "Is the activity log auditable?", a: "Yes. Every execution emits a Sui event — an immutable, timestamped record. Every row in the activity log links to Sui Explorer so you can verify it yourself." },
    ],
  },
];

function FaqSection({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq-list">
      {items.map((it, i) => (
        <div key={i} className={`faq-item${open === i ? " open" : ""}`}>
          <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{it.q}</span>
            <ChevronDown size={20} className="chev" />
          </button>
          <div className="faq-a" style={{ maxHeight: open === i ? 300 : 0 }}>
            <div className="faq-a-inner">{it.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="pub">
      <PublicHeader />
      <main className="pub-main">
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="section-head">
              <div className="kicker">FAQ</div>
              <h2 style={{ fontSize: 44 }}>Frequently asked questions</h2>
              <p>Everything you need to know about TEFAMA.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
            {FAQ_ALL.map((cat) => (
              <div key={cat.category} style={{ marginBottom: 48 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 20 }}>{cat.category}</h3>
                <FaqSection items={cat.items} />
              </div>
            ))}
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="cta-band">
              <h2>Still have questions?</h2>
              <p>Our team is happy to help. Or just try it — it's free.</p>
              <div className="hero-cta" style={{ gap: 12, flexWrap: "wrap" }}>
                <a href="#"><Button variant="secondary">Contact support</Button></a>
                <Link href="/connect"><Button variant="primary" icon={<Wallet size={18} />}>Start free</Button></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
