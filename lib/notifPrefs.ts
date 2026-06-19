const KEY = "tefama-notif-prefs";

export interface NotifPrefs {
  tradeExec: boolean;
  budgetWarning: boolean;
}

const DEFAULTS: NotifPrefs = { tradeExec: true, budgetWarning: true };

export function loadNotifPrefs(): NotifPrefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch { return { ...DEFAULTS }; }
}

export function saveNotifPrefs(p: NotifPrefs) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}
