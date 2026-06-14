"use client";
import { useState } from "react";
import { Bell, Shield, Palette, Globe, LogOut } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      background: checked ? "var(--orange-500)" : "var(--neutral-700)",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [s, setS] = useState({
    emailAlerts: true,
    budgetWarning: true,
    tradeNotif: false,
    twoFactor: false,
    biometric: true,
  });
  const set = (k: string, v: boolean) => setS((p) => ({ ...p, [k]: v }));

  const row = (label: string, desc: string, key: string) => (
    <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{desc}</div>
      </div>
      <Toggle checked={(s as Record<string, boolean>)[key]} onChange={(v) => set(key, v)} />
    </div>
  );

  return (
    <>
      <TopBar crumbs={[{ label: "Settings" }]} />
      <div className="page" style={{ maxWidth: 680 }}>
        <div className="page-head"><div><h1>Settings</h1><div className="sub">Manage your account preferences.</div></div></div>

        <Card className="panel" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div className="feature-ico" style={{ margin: 0 }}><Bell size={18} /></div>
            <h3>Notifications</h3>
          </div>
          {row("Email alerts", "Get email summaries of agent performance", "emailAlerts")}
          {row("Budget warnings", "Alert when an agent reaches 80% of its budget", "budgetWarning")}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Trade notifications</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Alert on every trade execution</div>
            </div>
            <Toggle checked={s.tradeNotif} onChange={(v) => set("tradeNotif", v)} />
          </div>
        </Card>

        <Card className="panel" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div className="feature-ico" style={{ margin: 0 }}><Shield size={18} /></div>
            <h3>Security</h3>
          </div>
          {row("Two-factor authentication", "Require 2FA for agent deployment and revocation", "twoFactor")}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Biometric unlock</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Use fingerprint or face ID to unlock the app</div>
            </div>
            <Toggle checked={s.biometric} onChange={(v) => set("biometric", v)} />
          </div>
        </Card>

        <Card className="panel" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div className="feature-ico" style={{ margin: 0 }}><Globe size={18} /></div>
            <h3>Account</h3>
          </div>
          <div className="dl">
            {[["Email", "user@gmail.com"], ["Plan", "Free"], ["Network", "Sui Testnet"], ["Member since", "Jun 2026"]].map(([k, v]) => (
              <div key={k} className="r">
                <span className="k">{k}</span>
                <span className="v" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ paddingTop: 8 }}>
          <Button variant="danger" icon={<LogOut size={16} />} onClick={() => router.push("/connect")}>
            Disconnect wallet
          </Button>
        </div>
      </div>
    </>
  );
}
