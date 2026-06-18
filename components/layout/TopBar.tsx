"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";

interface Crumb { label: string; path?: string; }

interface TopBarProps {
  crumbs: Crumb[];
  children?: React.ReactNode;
}

export default function TopBar({ crumbs, children }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="crumb">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <span className="sep"><ChevronRight size={14} /></span>}
            {c.path ? (
              <Link href={c.path} style={{ color: "var(--text-secondary)" }}>{c.label}</Link>
            ) : (
              <span className="cur">{c.label}</span>
            )}
          </span>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      {children && <div className="topbar-right">{children}</div>}
      <NotificationBell />
    </header>
  );
}
