"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Fingerprint, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function BiometricPage() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "scanning" | "done">("idle");

  const scan = () => {
    setState("scanning");
    setTimeout(() => {
      setState("done");
      setTimeout(() => router.push("/dashboard"), 700);
    }, 1400);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card rise">
        <div className="auth-logo">
          <Image src="/logo-mark.png" alt="TEFAMA" width={32} height={32} style={{ objectFit: "contain" }} />
          <span className="logo-word" style={{ fontSize: 18 }}>TEFAMA</span>
        </div>
        <Card variant="raised" style={{ padding: 40, textAlign: "center" }}>
          <div className="auth-orb" style={{ animation: state === "scanning" ? "glow-pulse 0.8s ease-in-out infinite" : "none" }}>
            {state === "done" ? <ShieldCheck size={48} /> : <Fingerprint size={48} />}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            {state === "idle" ? "Verify your identity" : state === "scanning" ? "Scanning…" : "Verified!"}
          </h2>
          <p className="txt-sec" style={{ fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            {state === "idle"
              ? "Use your device biometric to authorize access to your wallet. This stays local — we never see it."
              : state === "scanning"
              ? "Hold still…"
              : "Identity confirmed. Taking you to your dashboard."}
          </p>
          {state === "idle" && (
            <Button variant="primary" block size="lg" onClick={scan} icon={<Fingerprint size={20} />}>
              Use biometric
            </Button>
          )}
          {state === "idle" && (
            <button
              onClick={() => router.push("/verify-email")}
              style={{ marginTop: 16, fontSize: 13, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
            >
              Use email code instead
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}
