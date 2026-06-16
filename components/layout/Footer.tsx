import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

function XGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubGlyph({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function DiscordGlyph({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

export function FooterHero() {
  return (
    <section className="footer-hero">
      <div className="fh-bg">
        <svg className="fh-rings" viewBox="0 0 920 920" fill="none" aria-hidden="true">
          <g className="ring-a">
            <circle cx="460" cy="460" r="458" stroke="var(--border-subtle)" />
            <circle cx="460" cy="460" r="360" stroke="rgba(var(--brand-rgb),0.12)" strokeDasharray="2 12" />
            <circle cx="460" cy="2" r="5" fill="var(--gold-500)" />
          </g>
          <g className="ring-b">
            <circle cx="460" cy="460" r="270" stroke="var(--border-subtle)" />
            <circle cx="460" cy="190" r="4" fill="var(--orange-500)" />
          </g>
          <circle cx="460" cy="460" r="170" stroke="rgba(var(--brand-rgb),0.10)" />
        </svg>
      </div>
      <div className="fh-inner">
        {/* Animated emblem */}
        <div className="emblem" style={{ width: 132, height: 132 }}>
          <span className="emblem-halo" />
          <svg className="emblem-orbit" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <circle cx="60" cy="60" r="58" stroke="var(--border-subtle)" />
            <g className="ring-a">
              <circle cx="60" cy="60" r="48" stroke="rgba(var(--brand-rgb),0.3)" strokeDasharray="2 9" />
              <circle cx="60" cy="12" r="3.2" fill="var(--gold-500)" />
            </g>
            <g className="ring-b">
              <circle cx="60" cy="60" r="34" stroke="var(--border-default)" />
              <circle cx="60" cy="26" r="2.6" fill="var(--orange-500)" />
            </g>
            <circle cx="60" cy="60" r="23" stroke="rgba(var(--brand-rgb),0.12)" />
          </svg>
          <Image
            className="emblem-mark"
            src="/logo-mark.png"
            alt="TEFAMA"
            width={74}
            height={74}
            style={{ objectFit: "contain" }}
          />
        </div>
        <h2>Your agents are standing by.</h2>
        <p>Set a budget, choose a strategy, and let it trade — on-chain, within your limits, reversible in a single tap.</p>
        <div className="fh-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Free forever <span className="d" /> No card <span className="d" /> Revoke anytime
        </div>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="pub-footer">
      <div className="container footer-min">
        <div className="footer-id">
          <Logo />
          <p>Autonomous trading on Sui.</p>
        </div>
        <nav className="footer-nav">
          <Link href="/features">Features</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/faq">FAQ</Link>
          <a href="#">Docs</a>
        </nav>
        <div className="footer-social">
          <a aria-label="X (Twitter)"><XGlyph /></a>
          <a aria-label="GitHub"><GitHubGlyph /></a>
          <a aria-label="Discord"><DiscordGlyph /></a>
        </div>
      </div>
      <div className="container footer-base">
        <span>© 2026 TEFAMA</span>
        <span className="footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </span>
      </div>
    </footer>
  );
}
