import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ZkLoginProvider } from "@/context/ZkLoginContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "TEFAMA — Autonomous Agent Wallet",
  description: "AI agents trade for you on Sui, within limits you set and enforce on-chain.",
};

/* Dark is the default; light toggles in. Runs before React hydration to prevent FOUC. */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("tefama-theme");
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <ZkLoginProvider>{children}</ZkLoginProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
