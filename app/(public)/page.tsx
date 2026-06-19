"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

/* one ECG cycle = 240px wide, baseline at y=30, total height 60 */
const ECG_CYCLE =
  "M0,30 L40,30 L48,33 L52,27 L56,33 L60,30 " +   // P wave
  "L80,30 L86,38 L92,2 L96,46 L100,30 " +           // QRS complex
  "L112,30 C118,30 122,20 126,20 C130,20 134,30 140,30 " + // T wave
  "L240,30";                                          // flat to next cycle

function EcgLine() {
  /* repeat the cycle 8× to fill a wide strip, then we shift by one cycle width */
  const path = Array.from({ length: 8 }, (_, i) =>
    ECG_CYCLE.replace(/(\d+(?:\.\d+)?)/g, (n) =>
      String(parseFloat(n) + (n === "30" || n === "33" || n === "27" || n === "38" || n === "2" || n === "46" || n === "20" ? 0 : i * 240))
    )
  ).join(" ");

  // build path by offsetting X coords for each repeat
  const cycles = Array.from({ length: 8 }, (_, i) => {
    const dx = i * 240;
    return ECG_CYCLE
      .split(" ")
      .map(cmd => {
        if (/^[MLCm]$/.test(cmd)) return cmd;
        // parse coordinate pairs and shift X
        return cmd.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (_, x, y) =>
          `${parseFloat(x) + dx},${y}`
        );
      })
      .join(" ");
  }).join(" ");

  return (
    <svg className="hero-ecg" viewBox="0 0 1920 60" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ecgFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(34,211,238,0)"   />
          <stop offset="15%"  stopColor="rgba(34,211,238,0.6)" />
          <stop offset="85%"  stopColor="rgba(34,211,238,0.6)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)"   />
        </linearGradient>
      </defs>
      <g className="ecg-scroll">
        <path d={cycles} fill="none" stroke="url(#ecgFade)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

import {
  ArrowRight, ChevronDown,
  Fingerprint, SlidersHorizontal, Rocket, Gauge,
  Boxes, FileLock2,
} from "lucide-react";
import { FAQ_HOME } from "@/lib/data";


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

const HOME_STEPS = [
  { Icon: Fingerprint,       h: "Sign in",           b: "Use Google. Your Sui wallet is created instantly via zkLogin." },
  { Icon: SlidersHorizontal, h: "Set a budget",       b: "Pick a SUI amount, a strategy, and how long to run." },
  { Icon: Rocket,            h: "Go live",            b: "The agent places real trades on DeepBook every hour within your cap." },
  { Icon: Gauge,             h: "Stay in control",    b: "Watch every trade. Pause or revoke. Anytime." },
];

const TRUST = [
  { Icon: Boxes,      h: "You own the vault",      b: "Your SUI goes into a smart contract vault you control. The agent can only spend what you allow — it cannot touch anything outside its limit." },
  { Icon: Fingerprint,h: "No seed phrases",        b: "Sign in with Google. A Sui wallet is derived for you via zkLogin. No extension, no 24-word phrase, no private key to manage." },
  { Icon: FileLock2,  h: "Limits enforced on-chain", b: "Budget caps are written into a Move contract. The Sui VM rejects any trade that would exceed them — not our servers, the blockchain itself." },
];

export default function HomePage() {
  return (
    <>
      {/* ======== HERO ======== */}
      <section className="hero-v2">
        {/* layered background */}
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="glow-c" />
          <div className="hero-side-l" />
          <div className="hero-side-r" />
          <div className="hero-particles" aria-hidden="true">
            <span className="p p1" /><span className="p p2" /><span className="p p3" />
            <span className="p p4" /><span className="p p5" /><span className="p p6" />
            <span className="p p7" /><span className="p p8" /><span className="p p9" />
            <span className="p p10" /><span className="p p11" /><span className="p p12" />
          </div>
          <Image
            className="hero-watermark"
            src="/logo-mark-watermark.png"
            alt=""
            width={480}
            height={480}
            aria-hidden="true"
            priority
          />
          <EcgLine />
          <div className="vignette" />
        </div>

        {/* centered content */}
        <div className="hero-inner">
          <h1 className="hero-title fu fu-1">
            Set a budget.<br />
            <span className="l2">Let it trade.</span>
          </h1>
          <p className="hero-sub fu fu-2">
            AI agents trade on-chain for you — inside the limits you set.
            Stop anytime, with a single tap.
          </p>
          <div className="hero-actions fu fu-3">
            <Link href="/connect">
              <button className="glass-pill primary">
                Get started <ArrowRight size={18} />
              </button>
            </Link>
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


      {/* ======== MOBILE APP ======== */}
      <section className="section-sm">
        <div className="container">
          <div className="band" style={{
            background: "linear-gradient(135deg, var(--ink-a04) 0%, var(--brand-tint) 100%)",
            borderRadius: 24, padding: "48px 40px",
            border: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 32,
          }}>
            {/* Left: headline + description */}
            <div style={{ flex: "1 1 300px", maxWidth: 420 }}>
              <div className="kicker" style={{ marginBottom: 12 }}>Mobile app</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginBottom: 14 }}>
                Your agent wallet,<br />in your pocket
              </h2>
              <p className="txt-sec" style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Monitor trades, check your vault balance, and control your DCA agent from anywhere. Same Google login, same vault — no seed phrase required.
              </p>
            </div>

            {/* Right: download buttons + learn more */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
              <a href="https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/d78ed8f7-5048-4145-9499-fdf56f993cd2" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#3DDC84", color: "#000", padding: "13px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1-2.18-2.18C4 12.29 4.98 11.32 6.18 11.32a2.18 2.18 0 0 1 0 4.36m11.64 0a2.18 2.18 0 0 1-2.18-2.18 2.18 2.18 0 0 1 2.18-2.18 2.18 2.18 0 0 1 0 4.36M6.5 9.33L4.96 6.62a.33.33 0 0 1 .12-.45.33.33 0 0 1 .45.12l1.56 2.75A9.34 9.34 0 0 1 12 8.1c1.35 0 2.63.29 3.79.8l1.56-2.75a.33.33 0 0 1 .57.33L16.38 9.3A9.39 9.39 0 0 1 20 16.5H4a9.39 9.39 0 0 1 3.62-7.17z"/></svg>
                  Download APK · Android
                </div>
              </a>
              <a href="https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/8d5203bb-f5f7-4641-b403-72e72ed5fa9a" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--ink-a08)", color: "var(--text-primary)", border: "1px solid var(--border-default)", padding: "13px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  Download · iOS Simulator
                </div>
              </a>
              <Link href="/mobile" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--orange-400)", fontSize: 13, fontWeight: 600, textDecoration: "none", paddingLeft: 4 }}>
                Learn more <ArrowRight size={14} />
              </Link>
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
