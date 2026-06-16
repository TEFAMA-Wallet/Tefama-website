"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Wallet } from "lucide-react";

export default function PublicHeader() {
  const pathname = usePathname();
  return (
    <header className="pub-header">
      <Logo priority />
      <nav className="pub-nav">
        <Link href="/how-it-works" className={pathname === "/how-it-works" ? "active" : ""}>
          How it works
        </Link>
        <Link href="/features" className={pathname === "/features" ? "active" : ""}>
          Features
        </Link>
        <Link href="/faq" className={pathname === "/faq" ? "active" : ""}>
          FAQ
        </Link>
      </nav>
      <div className="topbar-spacer" />
      <ThemeToggle />
      <Link href="/connect">
        <Button variant="primary" icon={<Wallet size={16} />}>
          Connect wallet
        </Button>
      </Link>
    </header>
  );
}
