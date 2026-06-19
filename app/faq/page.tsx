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
      {
        q: "Do I need a wallet, seed phrase, or browser extension?",
        a: "No. TEFAMA uses Sui zkLogin — sign in with your Google account and a Sui wallet address is derived for you automatically via a zero-knowledge proof. No seed phrase, no extension, no separate wallet app.",
      },
      {
        q: "Is TEFAMA free to use?",
        a: "Yes. TEFAMA is free to use on Sui Testnet as part of the Sui Overflow hackathon. All tokens used are testnet tokens with no real monetary value.",
      },
      {
        q: "What network does TEFAMA run on?",
        a: "Sui Testnet. The app connects to Sui's testnet RPC, trades on the testnet DeepBook v3 pool, and all balances are testnet tokens. Mainnet is the next milestone after the hackathon.",
      },
    ],
  },
  {
    category: "Agents & trading",
    items: [
      {
        q: "What does the agent actually do?",
        a: "It runs a Dollar-Cost Averaging (DCA) strategy on DeepBook v3. Every hour it checks the DEEP/SUI price. If the price is within 5% of the 24-hour low, it places a real market buy order using the vault's SUI budget. Every trade is confirmed on-chain.",
      },
      {
        q: "Which exchange does it trade on?",
        a: "DeepBook v3 — the native central-limit order book built into Sui. Trades are real on-chain fills against the DEEP/SUI pool via a BalanceManager, not simulated swaps.",
      },
      {
        q: "What strategies are available?",
        a: "The app offers four strategy options: DCA, Buy-the-Dip, Grid Trading, and Momentum. The live on-chain execution currently runs the DCA strategy — buy DEEP when price is near the 24-hour low.",
      },
      {
        q: "What happens if the budget runs out?",
        a: "The agent checks the remaining vault budget before every trade. If the budget is exhausted, it skips the trade. The vault contract enforces this at the Move level — no overspend is possible.",
      },
    ],
  },
  {
    category: "Security",
    items: [
      {
        q: "How are budget limits enforced?",
        a: "Budget caps are written into a Move smart contract (the vault) on Sui. The vault uses a hot-potato pattern — request_trade() issues a receipt that must be consumed by settle_trade() in the same transaction. The Sui VM rejects any transaction that would exceed the cap. TEFAMA's servers cannot override this.",
      },
      {
        q: "How do I pause or revoke the agent?",
        a: "From the Vault settings page, one click calls set_paused(true) on the vault contract — the agent checks this flag before every trade and stops immediately. Revoking calls remove_agent(), permanently removing the agent from the allowlist. Your vault balance remains in the contract under your ownership.",
      },
      {
        q: "Is the activity log verifiable on-chain?",
        a: "Yes. Every trade emits TradeSettled and Charged events on Sui — immutable and timestamped. Every row in the activity feed links directly to Sui Explorer so you can verify the exact transaction yourself.",
      },
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
          <div className="container">
            <div className="faq-page-grid">
              {FAQ_ALL.map((cat) => (
                <div key={cat.category} className="faq-page-col">
                  <h3 className="faq-cat-label">{cat.category}</h3>
                  <FaqSection items={cat.items} />
                </div>
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
                  <Button variant="primary" icon={<Wallet size={18} />}>Get started</Button>
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
