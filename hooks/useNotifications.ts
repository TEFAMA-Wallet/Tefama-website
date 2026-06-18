"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePrice, useWallet, useTrades } from "./useOnchain";
import { useZkLogin } from "@/context/ZkLoginContext";

export type NotifType = "trade" | "budget_warning" | "budget_exhausted" | "agent_paused" | "agent_active" | "agent_triggered";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: number; // unix ms
  read: boolean;
  link?: string;
}

const STORAGE_KEY = "tefama-notifications";
const MAX_NOTIFS  = 50;

function load(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(notifs: Notification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, MAX_NOTIFS))); } catch {}
}

function push(notifs: Notification[], next: Omit<Notification, "read">): Notification[] {
  if (notifs.some(n => n.id === next.id)) return notifs; // deduplicate
  return [{ ...next, read: false }, ...notifs].slice(0, MAX_NOTIFS);
}

export function useNotifications() {
  const { address } = useZkLogin();
  const { deepPrice } = usePrice();
  const { vault }   = useWallet(address);
  const { trades }  = useTrades(vault?.id, deepPrice);

  const [notifs, setNotifs] = useState<Notification[]>([]);
  const seenTrades    = useRef<Set<string>>(new Set());
  const firstTradeSet = useRef(false); // true after first trades fetch — skip initial batch
  const lastPaused    = useRef<boolean | null>(null);
  const warned80      = useRef(false);
  const warned100     = useRef(false);
  const initialized   = useRef(false);

  // Load from storage once on mount — also pre-seed seenTrades so existing
  // trades don't fire as "new" on every page visit
  useEffect(() => {
    const stored = load();
    setNotifs(stored);
    stored.forEach(n => {
      if (n.id.startsWith("trade-")) seenTrades.current.add(n.id.slice(6));
    });
    initialized.current = true;
  }, []);

  // Persist whenever notifs change (after init)
  useEffect(() => {
    if (!initialized.current) return;
    save(notifs);
  }, [notifs]);

  // Watch new trades — skip the first fetch (those are historical, not new events)
  useEffect(() => {
    if (!trades?.length) return;

    if (!firstTradeSet.current) {
      // First load: mark all existing trades as seen without notifying
      trades.forEach((tx: any) => seenTrades.current.add(tx.id));
      firstTradeSet.current = true;
      return;
    }

    let updated = [...notifs];
    let changed = false;

    trades.forEach((tx: any) => {
      if (seenTrades.current.has(tx.id)) return;
      seenTrades.current.add(tx.id);
      changed = true;
      updated = push(updated, {
        id:    `trade-${tx.id}`,
        type:  "trade",
        title: "Trade executed",
        body:  `Bought ${tx.baseReceived.toFixed(4)} DEEP for ${tx.quoteSpent.toFixed(4)} SUI`,
        time:  Date.now(),
        link:  tx.explorerUrl,
      });
    });

    if (changed) setNotifs(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trades]);

  // Watch vault state (budget warnings, pause)
  useEffect(() => {
    if (!vault) return;
    let updated = [...notifs];
    let changed = false;

    const pct = vault.budgetCap > 0 ? (vault.spent / vault.budgetCap) * 100 : 0;

    if (pct >= 100 && !warned100.current) {
      warned100.current = true;
      changed = true;
      updated = push(updated, {
        id:    `budget-100-${Date.now()}`,
        type:  "budget_exhausted",
        title: "Daily budget exhausted",
        body:  `Agent hit its ${vault.budgetCap.toFixed(2)} SUI cap. It will resume tomorrow.`,
        time:  Date.now(),
        link:  "/agents/vault",
      });
    } else if (pct >= 80 && pct < 100 && !warned80.current) {
      warned80.current = true;
      changed = true;
      updated = push(updated, {
        id:    `budget-80-${Date.now()}`,
        type:  "budget_warning",
        title: "Budget at 80%",
        body:  `Agent has used ${vault.spent.toFixed(4)} of ${vault.budgetCap.toFixed(4)} SUI today.`,
        time:  Date.now(),
        link:  "/agents/vault",
      });
    } else if (pct < 80) {
      warned80.current = false;
      warned100.current = false;
    }

    const isPaused = vault.paused;
    if (lastPaused.current !== null && isPaused !== lastPaused.current) {
      changed = true;
      updated = push(updated, {
        id:    `vault-${isPaused ? "paused" : "active"}-${Date.now()}`,
        type:  isPaused ? "agent_paused" : "agent_active",
        title: isPaused ? "Agent paused" : "Agent resumed",
        body:  isPaused
          ? "Your DCA agent has been paused. Trades will not execute."
          : "Your DCA agent is running again.",
        time:  Date.now(),
        link:  "/agents/vault",
      });
    }
    lastPaused.current = isPaused;

    if (changed) setNotifs(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault]);

  const markAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clear = useCallback(() => {
    setNotifs([]);
  }, []);

  // Called from agents/new after deploy
  const addAgentTriggered = useCallback(() => {
    setNotifs(prev => push(prev, {
      id:    `agent-triggered-${Date.now()}`,
      type:  "agent_triggered",
      title: "Agent triggered",
      body:  "DCA agent executed a trade on DeepBook. Check activity for the result.",
      time:  Date.now(),
      link:  "/activity",
    }));
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  return { notifs, unread, markAllRead, markRead, clear, addAgentTriggered };
}
