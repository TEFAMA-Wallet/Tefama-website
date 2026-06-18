"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useZkLogin } from "@/context/ZkLoginContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { session } = useZkLogin();
  const email = session?.email ?? "";

  return (
    <div className="auth-wrap">
      <div className="auth-card rise">
        <div className="auth-logo">
          <Image src="/logo-mark.png" alt="TEFAMA" width={32} height={32} style={{ objectFit: "contain" }} />
          <span className="logo-word" style={{ fontSize: 18 }}>TEFAMA</span>
        </div>
        <Card variant="raised" style={{ padding: 36 }}>
          <div className="auth-orb">
            <ShieldCheck size={48} />
          </div>
          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Email verified
          </h2>
          <p className="txt-sec" style={{ textAlign: "center", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Signed in as<br />
            <strong style={{ color: "var(--text-primary)", fontSize: 15 }}>{email}</strong>
          </p>
          <Button
            variant="primary"
            block
            size="lg"
            onClick={() => router.push("/biometric")}
          >
            Continue
          </Button>
        </Card>
      </div>
    </div>
  );
}
