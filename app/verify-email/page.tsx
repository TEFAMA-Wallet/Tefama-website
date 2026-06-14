"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = () => {
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card rise">
        <div className="auth-logo">
          <Image src="/logo-mark.png" alt="TEFAMA" width={32} height={32} style={{ objectFit: "contain" }} />
          <span className="logo-word" style={{ fontSize: 18 }}>TEFAMA</span>
        </div>
        <Card variant="raised" style={{ padding: 36 }}>
          <div className="auth-orb">
            <Mail size={48} />
          </div>
          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
          <p className="txt-sec" style={{ textAlign: "center", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            We sent a 6-digit code to <strong style={{ color: "var(--text-primary)" }}>your@email.com</strong>.<br />
            Enter it below to access your wallet.
          </p>

          <div className="form-group">
            <label className="form-label">Verification code</label>
            <input
              className="form-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              style={{ fontSize: 22, letterSpacing: "0.3em", textAlign: "center", fontFamily: "var(--font-mono)" }}
            />
          </div>

          <Button
            variant="primary"
            block
            size="lg"
            onClick={verify}
            disabled={code.length !== 6 || loading}
            icon={loading ? undefined : <Check size={18} />}
          >
            {loading ? "Verifying…" : "Verify & open wallet"}
          </Button>

          <p style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", marginTop: 16 }}>
            Didn&apos;t get it?{" "}
            <button style={{ color: "var(--orange-400)", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
              Resend code
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}
