"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, X, ExternalLink, Bot, AlertTriangle, TrendingDown, CheckCircle, Zap, Trash2 } from "lucide-react";
import Link from "next/link";
import { useNotifications, type Notification, type NotifType } from "@/hooks/useNotifications";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000)  return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function NotifIcon({ type }: { type: NotifType }) {
  const style = { flexShrink: 0, marginTop: 2 };
  switch (type) {
    case "trade":            return <Zap          size={15} style={{ ...style, color: "var(--orange-400)" }} />;
    case "budget_warning":   return <AlertTriangle size={15} style={{ ...style, color: "#f59e0b" }} />;
    case "budget_exhausted": return <TrendingDown  size={15} style={{ ...style, color: "var(--ember-500)" }} />;
    case "agent_paused":     return <AlertTriangle size={15} style={{ ...style, color: "var(--ember-500)" }} />;
    case "agent_active":     return <CheckCircle   size={15} style={{ ...style, color: "#22c55e" }} />;
    case "agent_triggered":  return <Bot           size={15} style={{ ...style, color: "var(--orange-400)" }} />;
  }
}

function NotifItem({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  const inner = (
    <div
      onClick={() => onRead(n.id)}
      style={{
        display: "flex", gap: 10, padding: "12px 16px",
        background: n.read ? "transparent" : "var(--brand-tint)",
        borderBottom: "1px solid var(--border-subtle)",
        cursor: "pointer", transition: "background 0.15s",
      }}
    >
      <NotifIcon type={n.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: "var(--text-primary)" }}>
            {n.title}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)", flexShrink: 0 }}>{timeAgo(n.time)}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.5 }}>{n.body}</div>
      </div>
      {n.link && <ExternalLink size={12} style={{ color: "var(--text-disabled)", flexShrink: 0, marginTop: 4 }} />}
    </div>
  );

  if (n.link && n.link.startsWith("http")) {
    return <a href={n.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "block" }}>{inner}</a>;
  }
  if (n.link) {
    return <Link href={n.link} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>;
  }
  return inner;
}

export default function NotificationBell() {
  const { notifs, unread, markAllRead, markRead, clear } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => {
    setOpen(o => {
      if (!o && unread > 0) setTimeout(markAllRead, 1200);
      return !o;
    });
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={toggle}
        aria-label="Notifications"
        style={{
          position: "relative", width: 38, height: 38, borderRadius: 10,
          background: open ? "var(--brand-tint)" : "var(--ink-a04)",
          border: `1px solid ${open ? "var(--orange-400)" : "var(--border-subtle)"}`,
          color: open ? "var(--orange-400)" : "var(--text-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
        }}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 18, height: 18, borderRadius: 9, padding: "0 4px",
            background: "var(--orange-500)", color: "#fff",
            fontSize: 10, fontWeight: 700, lineHeight: "18px", textAlign: "center",
            border: "2px solid var(--surface-base)",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 360, maxHeight: 480, borderRadius: 14,
          background: "var(--surface-overlay)", backdropFilter: "blur(20px)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          zIndex: 999, overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
              {unread > 0 && (
                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: "var(--brand-tint)", color: "var(--orange-400)", fontWeight: 600 }}>
                  {unread} new
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {notifs.length > 0 && (
                <button onClick={clear} title="Clear all" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-disabled)", padding: 6, borderRadius: 6, display: "flex" }}>
                  <Trash2 size={14} />
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-disabled)", padding: 6, borderRadius: 6, display: "flex" }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <Bell size={28} style={{ color: "var(--text-disabled)", margin: "0 auto 10px" }} />
                <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No notifications yet</div>
                <div style={{ fontSize: 12, color: "var(--text-disabled)", marginTop: 4 }}>
                  Events from your agent will appear here
                </div>
              </div>
            ) : (
              notifs.map(n => <NotifItem key={n.id} n={n} onRead={markRead} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
