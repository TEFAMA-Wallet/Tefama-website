"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { buildGoogleLoginUrl } from "@/lib/zklogin";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const REDIRECT_URI =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : "";

function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: "block" }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function ConnectPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    if (!GOOGLE_CLIENT_ID) {
      setError(
        "Google Client ID is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file."
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const redirectUri =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : REDIRECT_URI;
      const url = await buildGoogleLoginUrl(GOOGLE_CLIENT_ID, redirectUri);
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start login";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card rise">
        <div className="auth-logo">
          <Image
            src="/logo-mark.png"
            alt="TEFAMA"
            width={32}
            height={32}
            style={{ objectFit: "contain" }}
          />
          <span className="logo-word" style={{ fontSize: 18 }}>
            TEFAMA
          </span>
        </div>
        <Card variant="raised" style={{ padding: 32 }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Connect your wallet
          </h2>
          <p
            className="txt-sec"
            style={{ textAlign: "center", marginBottom: 24, fontSize: 14 }}
          >
            No password. No seed phrases.
          </p>

          <div className="info-box" style={{ marginBottom: 20 }}>
            <Info size={18} className="i" />
            <span>
              TEFAMA uses zkLogin for secure, privacy-preserving sign-in. Your
              funds stay in your wallet — we never access your private keys.
            </span>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: 14,
                background: "var(--status-revoked-tint)",
                border: "1px solid rgba(255,90,31,0.2)",
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 13,
                color: "var(--ember-500)",
                lineHeight: 1.6,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              className="auth-provider"
              onClick={handleGoogle}
              disabled={loading}
            >
              {loading ? (
                <span
                  style={{
                    width: 20,
                    height: 20,
                    border: "2px solid var(--orange-400)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
              ) : (
                <GoogleGlyph />
              )}
              {loading ? "Preparing login…" : "Sign in with Google"}
            </button>

            <button
              className="auth-provider"
              disabled
              title="Apple Sign-In coming soon"
              style={{ opacity: 0.4, cursor: "not-allowed" }}
            >
              <svg
                width="18"
                height="20"
                viewBox="0 0 384 512"
                fill="currentColor"
                style={{ display: "block" }}
              >
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              Sign in with Apple
              <span style={{ fontSize: 11, color: "var(--text-disabled)", marginLeft: 4 }}>
                (coming soon)
              </span>
            </button>
          </div>

          <p
            style={{
              fontSize: 12,
              color: "var(--text-tertiary)",
              textAlign: "center",
              marginTop: 20,
              lineHeight: 1.6,
            }}
          >
            By continuing you agree to our{" "}
            <a href="#" style={{ color: "var(--orange-400)" }}>
              Terms
            </a>{" "}
            and{" "}
            <a href="#" style={{ color: "var(--orange-400)" }}>
              Privacy Policy
            </a>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
