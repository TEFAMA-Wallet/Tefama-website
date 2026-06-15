import type { Metadata } from "next";
import "./globals.css";
import { ZkLoginProvider } from "@/context/ZkLoginContext";

export const metadata: Metadata = {
  title: "TEFAMA — Autonomous Agent Wallet",
  description: "AI agents trade for you on Sui, within limits you set and enforce on-chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ZkLoginProvider>{children}</ZkLoginProvider>
      </body>
    </html>
  );
}
