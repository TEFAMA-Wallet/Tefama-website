"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useZkLogin } from "@/context/ZkLoginContext";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isConnected, isLoading } = useZkLogin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.replace("/connect");
    }
  }, [isLoading, isConnected, router]);

  if (isLoading || !isConnected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-base)",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            border: "3px solid var(--orange-400)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            display: "inline-block",
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
