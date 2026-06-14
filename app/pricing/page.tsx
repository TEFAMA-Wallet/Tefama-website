"use client";
import Link from "next/link";
import { Check, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

const PLANS = [
  {
    name: "Free",
    price: "0",
    sub: "Forever free",
    badge: null,
    featured: false,
    features: [
      "Up to 3 agents",
      "$500 max budget per agent",
      "DCA & Buy-the-dip templates",
      "7-day activity log",
      "Basic portfolio dashboard",
      "Community support",
    ],
    cta: "Get started",
    href: "/connect",
  },
  {
    name: "Pro",
    price: "29",
    sub: "per month",
    badge: "Most popular",
    featured: true,
    features: [
      "Unlimited agents",
      "$10,000 max budget per agent",
      "All templates + custom strategies",
      "90-day activity log",
      "Advanced analytics & risk metrics",
      "Priority support",
      "Webhook alerts",
      "CSV export",
    ],
    cta: "Start Pro",
    href: "/connect",
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "Contact us",
    badge: null,
    featured: false,
    features: [
      "Everything in Pro",
      "Unlimited budget per agent",
      "Custom Move policy templates",
      "Dedicated support",
      "SLA guarantees",
      "Multi-team access",
    ],
    cta: "Contact sales",
    href: "#",
  },
];

export default function PricingPage() {
  return (
    <div className="pub">
      <PublicHeader />
      <main className="pub-main">
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="section-head">
              <div className="kicker">Pricing</div>
              <h2 style={{ fontSize: 44 }}>Simple, transparent pricing</h2>
              <p>Start free. Upgrade when you need more power.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="pricing-grid">
              {PLANS.map((plan) => (
                <div key={plan.name} className={`pricing-card${plan.featured ? " featured" : ""}`}>
                  {plan.badge && <div className="badge-pop">{plan.badge}</div>}
                  <h3>{plan.name}</h3>
                  <div className="price">
                    {plan.price === "Custom" ? (
                      <span style={{ fontSize: 28 }}>Custom</span>
                    ) : (
                      <><sup>$</sup>{plan.price}</>
                    )}
                  </div>
                  <div className="price-sub">{plan.sub}</div>
                  <ul>
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check size={15} className="ck" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <Button
                      variant={plan.featured ? "primary" : "secondary"}
                      block
                      icon={plan.href !== "#" ? <Wallet size={17} /> : undefined}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
                All plans include on-chain budget enforcement, zkLogin authentication, and Sui Testnet access.
                Mainnet coming soon.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
