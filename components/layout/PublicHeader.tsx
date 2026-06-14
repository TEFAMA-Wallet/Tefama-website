"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { Wallet } from "lucide-react";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  return (
    <header className="pub-header">
      <Logo />
      <nav className="pub-nav">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={pathname === n.href ? "active" : ""}>{n.label}</Link>
        ))}
      </nav>
      <div className="topbar-spacer" />
      <Link href="/connect">
        <Button variant="primary" icon={<Wallet size={18} />}>Connect wallet</Button>
      </Link>
    </header>
  );
}
