"use client";
import { useState } from "react";
import { Bell, Shield, Wallet, LogOut, Copy, Check, ExternalLink, User, ChevronRight } from "lucide-react";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { useZkLogin } from "@/context/ZkLoginContext";
import { useWallet } from "@/hooks/useOnchain";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: checked ? "var(--orange-500)" : "var(--neutral-700)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, paddingBottom: 14, borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ color: "var(--orange-400)" }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{title}</h3>
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{label}</span>
      <span style={{ fontSize: 13, fontFamily: mono ? "var(--font-mono)" : undefined, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { session, address, logout } = useZkLogin();
  const { vault } = useWallet(address);

  const email    = session?.email ?? "—";
  const name     = session?.name  ?? "—";
  const picture  = session?.picture;
  const shortAddr = address ? `${address.slice(0, 10)}…${address.slice(-8)}` : "—";

  const [copied, setCopied]    = useState(false);
  const [notifs, setNotifs]    = useState({ budgetWarning: true, tradeExec: true, weeklyReport: false });
  const [security, setSecurity] = useState({ biometric: true, sessionLock: false });

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const explorerUrl = address
    ? `https://suiscan.xyz/testnet/account/${address}`
    : "#";

  const vaultStatus = !vault ? "No vault" : vault.paused ? "Paused" : "Active";

  return (
    <>
      <TopBar crumbs={[{ label: "Settings" }]} />
      <div className="page" style={{ maxWidth: 700 }}>

        {/* Profile hero */}
        <Card variant="raised" className="rise" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {picture ? (
              <Image src={picture} alt={name} width={56} height={56} style={{ borderRadius: "50%", border: "2px solid var(--orange-400)", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--brand-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange-400)", border: "2px solid var(--orange-400)" }}>
                <User size={26} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{name}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{email}</div>
              <div style={{ marginTop: 6 }}>
                <Badge status="active" pulse={false}>zkLogin · Google</Badge>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Network</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--orange-400)" }}>Sui Testnet</div>
            </div>
          </div>
        </Card>

        {/* Wallet section */}
        <Card className="panel" style={{ marginBottom: 20 }}>
          <SectionHead icon={<Wallet size={17} />} title="Wallet" />
          <div style={{ paddingTop: 4 }}>
            <InfoRow label="Auth method" value="Google zkLogin (no seed phrase)" />
            <InfoRow label="Network" value="Sui Testnet" />
            <InfoRow label="Agent vault" value={vaultStatus} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
              <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Wallet address</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{shortAddr}</span>
                <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--orange-400)" : "var(--text-disabled)", display: "flex", padding: 4 }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color: "var(--text-disabled)", display: "flex", padding: 4 }}>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="panel" style={{ marginBottom: 20 }}>
          <SectionHead icon={<Bell size={17} />} title="Notifications" />
          <div style={{ paddingTop: 4 }}>
            <SettingRow label="Budget warnings" desc="Alert when agent hits 80% of its daily budget cap">
              <Toggle checked={notifs.budgetWarning} onChange={v => setNotifs(p => ({ ...p, budgetWarning: v }))} />
            </SettingRow>
            <SettingRow label="Trade executions" desc="Notify after every DCA trade the agent completes">
              <Toggle checked={notifs.tradeExec} onChange={v => setNotifs(p => ({ ...p, tradeExec: v }))} />
            </SettingRow>
            <SettingRow label="Weekly report" desc="Sunday summary of P&L, trades, and vault health">
              <Toggle checked={notifs.weeklyReport} onChange={v => setNotifs(p => ({ ...p, weeklyReport: v }))} />
            </SettingRow>
          </div>
        </Card>

        {/* Security */}
        <Card className="panel" style={{ marginBottom: 20 }}>
          <SectionHead icon={<Shield size={17} />} title="Security" />
          <div style={{ paddingTop: 4 }}>
            <SettingRow label="Biometric unlock" desc="Use Face ID or fingerprint when opening the app">
              <Toggle checked={security.biometric} onChange={v => setSecurity(p => ({ ...p, biometric: v }))} />
            </SettingRow>
            <SettingRow label="Session lock" desc="Auto-lock wallet after 15 minutes of inactivity">
              <Toggle checked={security.sessionLock} onChange={v => setSecurity(p => ({ ...p, sessionLock: v }))} />
            </SettingRow>
            <div
              onClick={() => router.push("/agents/vault")}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", cursor: "pointer" }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Agent permissions</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3 }}>View vault allowlist, pause or revoke the agent</div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} />
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="panel" style={{ marginBottom: 20, borderColor: "var(--ember-500, #f05)" }}>
          <SectionHead icon={<LogOut size={17} />} title="Session" />
          <div style={{ paddingTop: 12 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
              Disconnecting clears your local session. Your wallet, vault, and on-chain assets remain intact — just sign in with Google again to restore access.
            </p>
            <Button
              variant="danger"
              icon={<LogOut size={15} />}
              onClick={() => { logout(); router.push("/connect"); }}
            >
              Disconnect wallet
            </Button>
          </div>
        </Card>

      </div>
    </>
  );
}
