import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEFAMA — Autonomous Agent Wallet",
  description: "AI agents trade for you on Sui, within limits you set and enforce on-chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
