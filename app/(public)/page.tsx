"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, PenOff, ShieldCheck, Eye, LayoutGrid, Gauge, ChartLine, Radio, OctagonX, Bell, Boxes, Fingerprint, FileLock2, Check, ChevronDown, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { FAQ_HOME } from "@/lib/data";

function HeroRings() {
  return (
    <svg className="hero-rings" viewBox="0 0 660 660" fill="none" aria-hidden="true">
      <g style={{ animation: "spin 10s linear infinite", transformOrigin: "330px 330px" }}>
        <circle cx="330" cy="330" r="328" stroke="rgba(255,255,255,0.06)" />
        <circle cx="330" cy="330" r="250" stroke="rgba(255,140,0,0.16)" strokeDasharray="2 10" />
        <circle cx="330" cy="2" r="6" fill="#FFD700" />
      </g>
      <g style={{ animation: "spin-rev 14s linear infinite", transformOrigin: "330px 330px" }}>
        <circle cx="330" cy="330" r="185" stroke="rgba(255,255,255,0.07)" />
        <circle cx="330" cy="145" r="4" fill="#FF8C00" />
      </g>
      <circle cx="330" cy="330" r="110" stroke="rgba(255,140,0,0.1)" />
    </svg>
  );
}

function HeroPreview() {
  return (
    <Card variant="raised" style={{ padding: 0, overflow: "hidden", borderColor: "var(--border-default)", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
        <Image src="/logo-mark.png" alt="" width={22} height={22} style={{ objectFit: "contain" }} />
        <span style={{ fontWeight: 600, letterSpacing: "0.1em", fontSize: 13 }}>TEFAMA</span>
        <span style={{ flex: 1 }} />
        <Badge status="active" pulse>Live</Badge>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 4 }}>SUI Accumulator · DCA</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 600 }}>+$312.40</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--orange-400)" }}>+6.4% · 24h</div>
        </div>
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          {[["Trades", "42"], ["Success", "98%"], ["Slippage", "0.31%"]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{l}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 4, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Budget used</div>
        <div style={{ height: 6, background: "var(--white-a08)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "97%", background: "var(--orange-500)", borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          <span>$485 spent</span><span>$500 budget</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>Recent executions</div>
        {[["buy", "Bought 41.2 SUI", "5m ago"], ["buy", "Bought 39.8 SUI", "1h ago"], ["sell", "Sold 22.0 SUI", "3h ago"]].map(([t, l, time], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--white-a04)", display: "flex", alignItems: "center", justifyContent: "center", color: t === "buy" ? "var(--orange-400)" : "var(--text-secondary)", fontSize: 14 }}>
              {t === "buy" ? "↙" : "↗"}
            </span>
            <span style={{ flex: 1, fontSize: 13 }}>{l}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-tertiary)" }}>{time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FaqAccordion({ items }: { items: typeof FAQ_HOME }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-list">
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
  { Icon: PenOff, h: "No pop-ups", b: "Your agent trades on its own. You never sign a thing." },
  { Icon: ShieldCheck, h: "Can't overspend", b: "It never goes past the budget you set. Locked on-chain." },
  { Icon: Eye, h: "Always yours", b: "See every move. Pull the plug in one tap, anytime." },
];

const HOME_STEPS = [
  { h: "Sign in", b: "Use Google. That's it." },
  { h: "Set a budget", b: "Pick an amount and a strategy." },
  { h: "Go live", b: "Your agent starts trading." },
  { h: "Stay in control", b: "Watch it. Stop it. Anytime." },
];

const HOME_FEATURES = [
  { Icon: LayoutGrid, h: "Ready-made strategies", b: "Proven playbooks. Pick one and go." },
  { Icon: Gauge, h: "Risk score", b: "Know the risk before you commit." },
  { Icon: ChartLine, h: "Clear analytics", b: "ROI, win rate, the lot — at a glance." },
  { Icon: Radio, h: "Live tracking", b: "Watch every trade as it happens." },
  { Icon: OctagonX, h: "One-tap stop", b: "Kill any agent instantly." },
  { Icon: Bell, h: "Smart alerts", b: "We ping you when it matters." },
];

const TRUST = [
  { Icon: Boxes, h: "Funds never leave you", b: "Your money stays in your wallet the whole time." },
  { Icon: Fingerprint, h: "No seed phrases", b: "Just sign in with Google. Your keys stay on your device." },
  { Icon: FileLock2, h: "Limits are locked in", b: "Budget and time rules live on-chain. Nothing can break them." },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-v2">
        <div className="hero-bg">
          <div className="glow-c" />
          <Image className="hero-watermark" src="/logo-mark.png" alt="" fill style={{ objectFit: "contain" }} />
          <HeroRings />
          <div className="vignette" />
        </div>
        <div className="hero-inner">
          <span className="hero-tag"><span className="pdot" /> Autonomous agent wallet · Sui</span>
          <h1 className="hero-title">Set a budget.<br /><span className="l2">Let it trade.</span></h1>
          <p className="hero-sub">AI agents trade for you, around the clock — inside the limits you set. Stop anytime, with a single tap.</p>
          <div className="hero-actions">
            <Link href="/how-it-works" className="glass-pill primary">See how it works <ArrowRight size={18} /></Link>
            <Link href="/features" className="glass-pill">Explore features</Link>
          </div>
          <div className="hero-reassure">
            <Check size={14} style={{ color: "var(--orange-400)" }} /> Free forever <span className="d" /> No card <span className="d" /> Live in 60 seconds
          </div>
        </div>
      </section>

      <section className="showcase">
        <div className="glow" />
        <div className="hero-float rise"><HeroPreview /></div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="grid-3">
            {VALUE_PROPS.map((v) => (
              <Card key={v.h} className="feature-card">
                <div className="feature-ico"><v.Icon size={24} /></div>
                <h3>{v.h}</h3><p>{v.b}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="kicker">How it works</div>
            <h2>Live in under a minute</h2>
            <p>Four steps. No jargon, no setup headaches.</p>
          </div>
          <div className="steps">
            {HOME_STEPS.map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{i + 1}</div>
                <h4>{s.h}</h4><p>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Why people love it</div>
            <h2>Everything you need. Nothing you don't.</h2>
            <p>Powerful under the hood. Simple on the surface.</p>
          </div>
          <div className="grid-3">
            {HOME_FEATURES.map((f) => (
              <Card key={f.h} className="feature-card">
                <div className="feature-ico"><f.Icon size={22} /></div>
                <h3>{f.h}</h3><p>{f.b}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="band">
            <div className="section-head" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 32 }}>Safe by design</h2>
            </div>
            <div className="grid-3">
              {TRUST.map((t) => (
                <div key={t.h} style={{ textAlign: "center" }}>
                  <div className="feature-ico" style={{ margin: "0 auto 18px" }}><t.Icon size={24} /></div>
                  <h3 style={{ fontSize: 18, marginBottom: 8 }}>{t.h}</h3>
                  <p className="txt-sec" style={{ fontSize: 14, lineHeight: 1.6 }}>{t.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="kicker">FAQ</div>
            <h2>Frequently asked questions</h2>
          </div>
          <FaqAccordion items={FAQ_HOME} />
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/faq"><Button variant="ghost" icon={<ArrowRight size={16} />}>See all questions</Button></Link>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="cta-band">
            <h2>Ready to put it on autopilot?</h2>
            <p>Free forever. No card. Start in 60 seconds.</p>
            <div className="hero-cta">
              <Link href="/connect">
                <Button variant="primary" size="lg" icon={<Wallet size={20} />}>Start free</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
