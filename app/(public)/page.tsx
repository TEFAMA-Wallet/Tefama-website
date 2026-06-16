"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight, Check, ChevronDown,
  PenOff, ShieldCheck, Eye,
  Fingerprint, SlidersHorizontal, Rocket, Gauge,
  Boxes, FileLock2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { FAQ_HOME } from "@/lib/data";

/* ---- Hero background rings ---- */
function HeroRings() {
  return (
    <svg className="hero-rings" viewBox="0 0 660 660" fill="none" aria-hidden="true">
      <g className="spin">
        <circle cx="330" cy="330" r="328" stroke="var(--border-subtle)" />
        <circle cx="330" cy="330" r="250" stroke="rgba(var(--brand-rgb),0.16)" strokeDasharray="2 10" />
        <circle cx="330" cy="2" r="6" fill="var(--gold-500)" />
      </g>
      <g className="spin-rev">
        <circle cx="330" cy="330" r="185" stroke="var(--border-default)" />
        <circle cx="330" cy="145" r="4" fill="var(--orange-500)" />
      </g>
      <circle cx="330" cy="330" r="110" stroke="rgba(var(--brand-rgb),0.10)" />
    </svg>
  );
}

/* ---- FAQ accordion ---- */
function FaqAccordion({ items }: { items: typeof FAQ_HOME }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-list faq-grid">
      {items.map((it, i) => (
        <div key={i} className={`faq-item${open === i ? " open" : ""}`}>
          <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{it.q}</span>
            <ChevronDown size={20} className="chev" />
          </button>
          <div className="faq-a" style={{ maxHeight: open === i ? 260 : 0 }}>
            <div className="faq-a-inner">{it.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const VALUE_PROPS = [
  { Icon: PenOff,      h: "No pop-ups",      b: "Your agent trades on its own. You never sign a thing." },
  { Icon: ShieldCheck, h: "Can't overspend",  b: "It never goes past the budget you set. Locked on-chain." },
  { Icon: Eye,         h: "Always yours",     b: "See every move. Pull the plug in one tap, anytime." },
];

const HOME_STEPS = [
  { Icon: Fingerprint,       h: "Sign in",           b: "Use Google. That's it." },
  { Icon: SlidersHorizontal, h: "Set a budget",       b: "Pick an amount and a strategy." },
  { Icon: Rocket,            h: "Go live",            b: "Your agent starts trading." },
  { Icon: Gauge,             h: "Stay in control",    b: "Watch it. Stop it. Anytime." },
];

const TRUST = [
  { Icon: Boxes,      h: "Funds never leave you",  b: "Your money stays in your wallet the whole time." },
  { Icon: Fingerprint,h: "No seed phrases",        b: "Just sign in with Google. Your keys stay on your device." },
  { Icon: FileLock2,  h: "Limits are locked in",  b: "Budget and time rules live on-chain. Nothing can break them." },
];

export default function HomePage() {
  return (
    <>
      {/* ======== HERO ======== */}
      <section className="hero-v2">
        {/* layered background */}
        <div className="hero-bg">
          <div className="glow-c" />
          {/* soft side glows */}
          <div className="hero-side-l" />
          <div className="hero-side-r" />
          {/* scattered particles on left + right */}
          <div className="hero-particles" aria-hidden="true">
            <span className="p p1" /><span className="p p2" /><span className="p p3" />
            <span className="p p4" /><span className="p p5" /><span className="p p6" />
            <span className="p p7" /><span className="p p8" /><span className="p p9" />
            <span className="p p10" /><span className="p p11" /><span className="p p12" />
          </div>
          <Image
            className="hero-watermark"
            src="/logo-mark.png"
            alt=""
            width={640}
            height={640}
            aria-hidden="true"
            priority
          />
          <HeroRings />
          <div className="vignette" />
        </div>

        {/* centered content */}
        <div className="hero-inner">
          <span className="hero-tag fu fu-1">
            <span className="pdot" /> Autonomous agent wallet · Sui
          </span>
          <h1 className="hero-title fu fu-2">
            Set a budget.<br />
            <span className="l2">Let it trade.</span>
          </h1>
          <p className="hero-sub fu fu-3">
            AI agents trade for you, around the clock — inside the limits you set.
            Stop anytime, with a single tap.
          </p>
          <div className="hero-actions fu fu-4">
            <Link href="/how-it-works">
              <button className="glass-pill primary">
                See how it works <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/features">
              <button className="glass-pill">Explore features</button>
            </Link>
          </div>
          <div className="hero-reassure fu fu-5">
            <Check size={14} style={{ color: "var(--orange-400)" }} />
            Free forever
            <span className="d" />
            No card
            <span className="d" />
            Live in 60 seconds
          </div>
        </div>
      </section>

      {/* ======== VALUE PROPS ======== */}
      <section className="section-sm" id="sec-features">
        <div className="container">
          <div className="grid-3">
            {VALUE_PROPS.map((v) => (
              <Card key={v.h} className="feature-card">
                <div className="feature-ico"><v.Icon size={24} /></div>
                <h3>{v.h}</h3>
                <p>{v.b}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className="section" id="sec-how">
        <div className="container">
          <div className="section-head">
            <div className="kicker">How it works</div>
            <h2>Live in under a minute</h2>
            <p>Four steps. No jargon, no setup headaches.</p>
          </div>
          <div className="steps">
            {HOME_STEPS.map((s, i) => (
              <div className="step" key={i}>
                {i < HOME_STEPS.length - 1 && <span className="step-line" />}
                <div className="step-ico">
                  <s.Icon size={26} />
                  <span className="step-num">{i + 1}</span>
                </div>
                <h4>{s.h}</h4>
                <p>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== SAFE BY DESIGN ======== */}
      <section className="section-sm">
        <div className="container">
          <div className="band">
            <div className="section-head" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 32 }}>Safe by design</h2>
            </div>
            <div className="grid-3">
              {TRUST.map((t) => (
                <div key={t.h} style={{ textAlign: "center" }}>
                  <div className="feature-ico" style={{ margin: "0 auto 18px" }}>
                    <t.Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: 18, marginBottom: 8 }}>{t.h}</h3>
                  <p className="txt-sec" style={{ fontSize: 14, lineHeight: 1.6 }}>{t.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======== FAQ ======== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="kicker">FAQ</div>
            <h2>Frequently asked questions</h2>
          </div>
          <FaqAccordion items={FAQ_HOME} />
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/faq" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>
              See all questions <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
