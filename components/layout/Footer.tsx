"use client";
import Logo from "@/components/ui/Logo";
import { GitBranch, Globe, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="pub-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Logo />
            <p className="txt-sec" style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280, marginTop: 16 }}>
              Autonomous trading on Sui, within limits you set and enforce on-chain. Grant authority, stay in control.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              {[GitBranch, Globe, MessageCircle].map((Icon, i) => (
                <span key={i} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <Icon size={17} />
                </span>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <Link href="/features">Features</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/dashboard">Open app</Link>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <a href="#">Docs</a>
            <Link href="/faq">FAQ</Link>
            <a href="#">Sui Explorer</a>
            <a href="#">Support</a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Acknowledgments</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 TEFAMA. All rights reserved.</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange-500)", boxShadow: "var(--glow-active)" }} />
            Sui Testnet · Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
