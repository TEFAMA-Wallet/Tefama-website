"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Bot, ChartLine, Activity, Wallet, Settings, CircleHelp, ExternalLink, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import { AGENTS } from "@/lib/data";
import { useZkLogin } from "@/context/ZkLoginContext";

const NAV_MAIN = [
  { key: "dashboard", path: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "agents", path: "/agents", label: "My agents", Icon: Bot, badge: AGENTS.filter((a) => a.status === "active").length },
  { key: "analytics", path: "/analytics", label: "Portfolio", Icon: ChartLine },
  { key: "activity", path: "/activity", label: "Activity", Icon: Activity },
];

const NAV_WALLET = [
  { key: "wallet", path: "/wallet", label: "Wallet", Icon: Wallet },
  { key: "settings", path: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const { address, shortAddress, logout } = useZkLogin();

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  };

  const item = (n: { key: string; path: string; label: string; Icon: React.ElementType; badge?: number }) => (
    <Link key={n.key} href={n.path} className={`sb-item${pathname === n.path ? " active" : ""}`}>
      <n.Icon size={19} className="ico" />
      <span>{n.label}</span>
      {n.badge ? <span className="sb-badge">{n.badge}</span> : null}
    </Link>
  );

  return (
    <aside className="sidebar">
      <Link href="/" className="sb-logo">
        <Image src="/logo-mark.png" alt="TEFAMA" width={24} height={24} style={{ objectFit: "contain" }} />
        <span className="logo-word">TEFAMA</span>
      </Link>
      <nav className="sb-nav">
        {NAV_MAIN.map(item)}
        <div className="sb-section">Account</div>
        {NAV_WALLET.map(item)}
        <Link href="/faq" className="sb-item">
          <CircleHelp size={19} className="ico" />
          <span>Help</span>
          <ExternalLink size={14} style={{ marginLeft: "auto", color: "var(--text-disabled)" }} />
        </Link>
      </nav>
      <div className="sb-wallet">
        <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={copy}>
          <span className="addr mono">{shortAddress ?? "—"}</span>
          {copied ? <Check size={13} style={{ color: "var(--orange-400)" }} /> : <Copy size={13} style={{ opacity: 0.4 }} />}
        </div>
        <div className="net"><span className="d" /> Sui Testnet · zkLogin</div>
        <button
          onClick={() => { logout(); router.push("/connect"); }}
          style={{ marginTop: 12, width: "100%", height: 34, borderRadius: 9, background: "var(--status-revoked-tint)", color: "var(--ember-500)", border: "1px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <LogOut size={14} /> Disconnect
        </button>
      </div>
    </aside>
  );
}
