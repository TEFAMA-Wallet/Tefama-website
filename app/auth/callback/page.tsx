"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { completeLogin } from "@/lib/zklogin";
import { useZkLogin } from "@/context/ZkLoginContext";

type Status = "processing" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setSession } = useZkLogin();
  const [status, setStatus] = useState<Status>("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const jwt = params.get("id_token");

    if (!jwt) {
      setErrorMsg(
        "No identity token found in the redirect. Please try signing in again."
      );
      setStatus("error");
      return;
    }

    completeLogin(jwt)
      .then((result) => {
        setSession({
          provider: "google",
          address: result.address,
          email: result.email,
          name: result.name,
          picture: result.picture,
          salt: result.salt,
          maxEpoch: result.maxEpoch,
          secretKey: result.secretKey,
          zkProof: result.zkProof,
          jwt: result.jwt,
        });
        router.replace("/biometric");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setErrorMsg(msg);
        setStatus("error");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        <Card variant="raised" style={{ padding: 40, textAlign: "center" }}>
          {status === "processing" && (
            <>
              <div className="auth-orb" style={{ animation: "glow-pulse 0.8s ease-in-out infinite" }}>
                <ShieldCheck size={48} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Verifying identity…
              </h2>
              <p
                className="txt-sec"
                style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}
              >
                Generating your zero-knowledge proof.
                <br />
                This takes a few seconds.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                {["Fetching salt", "Generating proof", "Deriving address"].map(
                  (step) => (
                    <div
                      key={step}
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid var(--orange-400)",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      {step}
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div
                className="auth-orb"
                style={{ color: "var(--ember-500)" }}
              >
                <AlertCircle size={48} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Login failed
              </h2>
              <p
                className="txt-sec"
                style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}
              >
                {errorMsg}
              </p>
              <button
                className="btn btn-primary btn-block"
                onClick={() => router.replace("/connect")}
              >
                Try again
              </button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
