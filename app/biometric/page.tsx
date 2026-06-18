"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Fingerprint, ShieldCheck, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useZkLogin } from "@/context/ZkLoginContext";

const CRED_KEY = "tefama-biometric-id";

async function runBiometric(email: string, name: string): Promise<void> {
  if (!window.PublicKeyCredential) return; // browser doesn't support WebAuthn — skip

  const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  if (!available) return; // no fingerprint/face ID hardware — skip silently

  const stored = localStorage.getItem(CRED_KEY);

  if (stored) {
    await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        timeout: 60000,
        userVerification: "required",
        allowCredentials: [{
          id: Uint8Array.from(atob(stored), c => c.charCodeAt(0)),
          type: "public-key",
          transports: ["internal"],
        }],
      },
    });
  } else {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "TEFAMA", id: window.location.hostname },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: email || "user",
          displayName: name || "TEFAMA User",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      },
    }) as PublicKeyCredential;

    const id = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
    localStorage.setItem(CRED_KEY, id);
  }
}

export default function BiometricPage() {
  const router = useRouter();
  const { session } = useZkLogin();
  const [state, setState] = useState<"checking" | "idle" | "scanning" | "done" | "error">("checking");
  const [errorMsg, setErrorMsg] = useState("");

  // On mount: check if biometric is available. If not, skip straight to dashboard.
  useEffect(() => {
    async function check() {
      if (!window.PublicKeyCredential) {
        router.replace("/dashboard");
        return;
      }
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        router.replace("/dashboard");
        return;
      }
      setState("idle");
    }
    check();
  }, [router]);

  const scan = async () => {
    setState("scanning");
    setErrorMsg("");
    try {
      await runBiometric(session?.email ?? "", session?.name ?? "");
      setState("done");
      setTimeout(() => router.push("/dashboard"), 700);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Biometric check failed.";
      setErrorMsg(msg);
      setState("error");
    }
  };

  if (state === "checking") {
    return (
      <div className="auth-wrap">
        <div className="auth-card rise">
          <div className="auth-logo">
            <Image src="/logo-mark.png" alt="TEFAMA" width={32} height={32} style={{ objectFit: "contain" }} />
            <span className="logo-word" style={{ fontSize: 18 }}>TEFAMA</span>
          </div>
          <Card variant="raised" style={{ padding: 40, textAlign: "center" }}>
            <div className="auth-orb"><Fingerprint size={48} /></div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Checking device…</h2>
            <p className="txt-sec" style={{ fontSize: 14 }}>Detecting biometric capability.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card rise">
        <div className="auth-logo">
          <Image src="/logo-mark.png" alt="TEFAMA" width={32} height={32} style={{ objectFit: "contain" }} />
          <span className="logo-word" style={{ fontSize: 18 }}>TEFAMA</span>
        </div>
        <Card variant="raised" style={{ padding: 40, textAlign: "center" }}>
          <div className="auth-orb" style={{
            color: state === "error" ? "var(--ember-500)" : "var(--orange-400)",
            animation: state === "scanning" ? "tefama-glow-breathe 0.8s ease-in-out infinite" : undefined,
          }}>
            {state === "done"  ? <ShieldCheck size={48} /> :
             state === "error" ? <AlertCircle size={48} /> :
             <Fingerprint size={48} />}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            {state === "idle"     ? "Verify your identity" :
             state === "scanning" ? "Waiting for biometric…" :
             state === "done"     ? "Verified!" :
             "Verification failed"}
          </h2>

          <p className="txt-sec" style={{ fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            {state === "idle"
              ? "Use your device fingerprint or face ID to secure your wallet. This stays local — we never see it."
              : state === "scanning"
              ? "Follow the prompt on your device."
              : state === "done"
              ? "Identity confirmed. Taking you to your dashboard."
              : errorMsg}
          </p>

          {(state === "idle" || state === "error") && (
            <Button variant="primary" block size="lg" onClick={scan} icon={<Fingerprint size={20} />}>
              {state === "error" ? "Try again" : "Use biometric"}
            </Button>
          )}

          {(state === "idle" || state === "error") && (
            <button
              onClick={() => router.push("/dashboard")}
              style={{ marginTop: 16, fontSize: 13, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
            >
              Skip for now
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}
