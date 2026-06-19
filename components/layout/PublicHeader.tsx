"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Wallet, Menu, X } from "lucide-react";

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <header className="pub-header">
        <Logo priority />
        <nav className="pub-nav">
          <Link href="/how-it-works" className={pathname === "/how-it-works" ? "active" : ""}>How it works</Link>
          <Link href="/features"     className={pathname === "/features"     ? "active" : ""}>Features</Link>
          <Link href="/mobile"       className={pathname === "/mobile"       ? "active" : ""}>Mobile app</Link>
          <Link href="/faq"          className={pathname === "/faq"          ? "active" : ""}>FAQ</Link>
        </nav>
        <div className="topbar-spacer" />
        <ThemeToggle />
        <Link href="/connect" className="pub-cta-btn">
          <Button variant="primary" icon={<Wallet size={16} />}>Connect wallet</Button>
        </Link>
        <button
          className="mob-menu-btn"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {open && (
        <nav className="mob-nav" onClick={close}>
          <Link href="/how-it-works" className={pathname === "/how-it-works" ? "mob-nav-link active" : "mob-nav-link"}>How it works</Link>
          <Link href="/features"     className={pathname === "/features"     ? "mob-nav-link active" : "mob-nav-link"}>Features</Link>
          <Link href="/mobile"       className={pathname === "/mobile"       ? "mob-nav-link active" : "mob-nav-link"}>Mobile app</Link>
          <Link href="/faq"          className={pathname === "/faq"          ? "mob-nav-link active" : "mob-nav-link"}>FAQ</Link>
          <Link href="/connect" className="mob-nav-cta">
            <Button variant="primary" icon={<Wallet size={16} />}>Connect wallet</Button>
          </Link>
        </nav>
      )}
    </>
  );
}
