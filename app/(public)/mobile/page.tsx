import Link from "next/link";
import { ArrowRight, Smartphone, Download } from "lucide-react";

const ANDROID_URL = "https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/d78ed8f7-5048-4145-9499-fdf56f993cd2";
const IOS_URL     = "https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/8d5203bb-f5f7-4641-b403-72e72ed5fa9a";
const GITHUB_URL  = "https://github.com/TEFAMA-Wallet/Tefama-mobile";

const SCREENS = [
  { label: "Dashboard",  desc: "Portfolio value, live P&L and agent status at a glance" },
  { label: "Wallet",     desc: "SUI, USDC and DEEP balances with live token logos" },
  { label: "Activity",   desc: "Every on-chain trade with timestamps and explorer links" },
  { label: "Analytics",  desc: "DCA performance, avg buy price and portfolio allocation" },
  { label: "Agent",      desc: "Budget ring, vault stats and pause / revoke controls" },
];

const FEATURES = [
  { h: "Same account, both platforms",  b: "Log in with the same Google account on web or mobile — your vault and trades appear instantly on both." },
  { h: "Real on-chain data",            b: "Balances, trades and P&L are fetched live from Sui testnet. Nothing is mocked." },
  { h: "Full agent control",            b: "Pause or revoke your DCA agent from your phone without touching the web app." },
  { h: "No seed phrase, ever",          b: "zkLogin means Google is your key. No extensions, no 24-word phrases." },
];

export default function MobilePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="section" style={{ paddingTop: 80 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="kicker">Mobile app</div>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
              Your agent wallet,<br />in your pocket
            </h1>
            <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.6 }}>
              The full TEFAMA experience on Android and iOS. Same Google login, same vault, real on-chain trades — no seed phrase required.
            </p>

            {/* Download buttons */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={ANDROID_URL} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#3DDC84", color: "#000",
                  padding: "14px 28px", borderRadius: 14, fontWeight: 700, fontSize: 15,
                  transition: "opacity 0.15s",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1-2.18-2.18C4 12.29 4.98 11.32 6.18 11.32a2.18 2.18 0 0 1 0 4.36m11.64 0a2.18 2.18 0 0 1-2.18-2.18 2.18 2.18 0 0 1 2.18-2.18 2.18 2.18 0 0 1 0 4.36M6.5 9.33L4.96 6.62a.33.33 0 0 1 .12-.45.33.33 0 0 1 .45.12l1.56 2.75A9.34 9.34 0 0 1 12 8.1c1.35 0 2.63.29 3.79.8l1.56-2.75a.33.33 0 0 1 .57.33L16.38 9.3A9.39 9.39 0 0 1 20 16.5H4a9.39 9.39 0 0 1 3.62-7.17z"/>
                  </svg>
                  Download APK · Android
                </div>
              </a>

              <a href={IOS_URL} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "var(--ink-a08)", color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  padding: "14px 28px", borderRadius: 14, fontWeight: 700, fontSize: 15,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Download · iOS Simulator
                </div>
              </a>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-tertiary)" }}>
              Android — install the APK directly on your phone &nbsp;·&nbsp; iOS — simulator build (Mac only)
            </div>
          </div>

          {/* Phone mockups strip */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
            {SCREENS.map((s) => (
              <div key={s.label} style={{
                width: 140,
                background: "var(--surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 20,
                padding: "12px 0",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                {/* phone frame */}
                <div style={{
                  width: 110, height: 180, borderRadius: 16,
                  background: "var(--ink-a04)", border: "1px solid var(--border-subtle)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, position: "relative", overflow: "hidden",
                }}>
                  {/* status bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 18, background: "var(--ink-a06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 28, height: 4, borderRadius: 2, background: "var(--ink-a12)" }} />
                  </div>
                  <Smartphone size={28} style={{ color: "var(--orange-400)", marginTop: 8 }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>{s.label}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", padding: "0 10px", lineHeight: 1.4 }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Features grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 56 }}>
            {FEATURES.map(f => (
              <div key={f.h} style={{
                background: "var(--surface-raised)", border: "1px solid var(--border-subtle)",
                borderRadius: 16, padding: 24,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.h}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{f.b}</p>
              </div>
            ))}
          </div>

          {/* GitHub + web app links */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", paddingBottom: 80 }}>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 8,
              color: "var(--text-secondary)", fontSize: 14, fontWeight: 500,
              border: "1px solid var(--border-default)", borderRadius: 10,
              padding: "10px 20px", textDecoration: "none",
            }}>
              <Download size={15} /> View on GitHub
            </a>
            <Link href="/connect" style={{
              display: "flex", alignItems: "center", gap: 8,
              color: "var(--orange-400)", fontSize: 14, fontWeight: 600,
              border: "1px solid var(--orange-400)", borderRadius: 10,
              padding: "10px 20px", textDecoration: "none",
            }}>
              Try the web app <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
