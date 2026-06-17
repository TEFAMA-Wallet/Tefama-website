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
            <Link href="/how-it-works">
              <button className="glass-pill">How it works</button>
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
