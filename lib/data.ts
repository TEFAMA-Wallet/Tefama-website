export const WALLET = {
  address: "0x7af3…9c21",
  fullAddress: "0x7af3e9b1c5d24a8f06e3b7d49c21",
  type: "zkLogin (Google)",
  network: "Sui Testnet",
  totalUsd: 45250.0,
  delta24hUsd: 2450.0,
  delta24hPct: 5.7,
};

export const TOKENS = [
  { sym: "USDC", name: "USD Coin", balance: 28420.5, usd: 28420.5, alloc: 62.8 },
  { sym: "SUI", name: "Sui", balance: 12640.0, price: 1.182, usd: 14940.5, alloc: 33.0 },
  { sym: "DEEP", name: "DeepBook", balance: 9200.0, price: 0.205, usd: 1886.0, alloc: 4.2 },
];

export const AGENTS = [
  { id: "agt_8f3a", name: "SUI Accumulator", strategy: "DCA", status: "active", budget: 500, spent: 485, pnl: 312.4, pnlPct: 6.4, trades: 42, volume: 14940, successRate: 98 },
  { id: "agt_2b1c", name: "BTC Mirror", strategy: "Buy-the-dip", status: "active", budget: 1000, spent: 720, pnl: 188.6, pnlPct: 3.8, trades: 18, volume: 9800, successRate: 94 },
  { id: "agt_5d7e", name: "Grid Trader", strategy: "Grid Trading", status: "paused", budget: 750, spent: 510, pnl: 94.2, pnlPct: 1.9, trades: 67, volume: 21300, successRate: 91 },
  { id: "agt_9a4f", name: "Momentum Pro", strategy: "Momentum", status: "active", budget: 600, spent: 390, pnl: -42.1, pnlPct: -0.9, trades: 29, volume: 8700, successRate: 89 },
  { id: "agt_3c8b", name: "Yield Farmer", strategy: "DCA", status: "active", budget: 400, spent: 280, pnl: 76.5, pnlPct: 2.1, trades: 15, volume: 5600, successRate: 96 },
  { id: "agt_7e2a", name: "Deep Scalper", strategy: "Grid Trading", status: "revoked", budget: 300, spent: 300, pnl: -18.3, pnlPct: -0.4, trades: 103, volume: 4200, successRate: 88 },
];

export const TRANSACTIONS = [
  { id: "tx_001", agent: "SUI Accumulator", type: "buy", asset: "SUI", amount: 41.2, usd: 48.7, status: "confirmed", time: "5m ago" },
  { id: "tx_002", agent: "BTC Mirror", type: "buy", asset: "SUI", amount: 84.5, usd: 99.9, status: "confirmed", time: "23m ago" },
  { id: "tx_003", agent: "SUI Accumulator", type: "buy", asset: "SUI", amount: 39.8, usd: 47.1, status: "confirmed", time: "1h ago" },
  { id: "tx_004", agent: "Grid Trader", type: "sell", asset: "DEEP", amount: 1200, usd: 246.0, status: "confirmed", time: "2h ago" },
  { id: "tx_005", agent: "SUI Accumulator", type: "sell", asset: "SUI", amount: 22.0, usd: 26.0, status: "confirmed", time: "3h ago" },
  { id: "tx_006", agent: "Momentum Pro", type: "buy", asset: "SUI", amount: 63.1, usd: 74.6, status: "pending", time: "4h ago" },
];

export const PORTFOLIO_SERIES = (() => {
  const pts: number[] = [];
  let v = 39800;
  for (let i = 0; i < 40; i++) {
    v += Math.sin(i / 3.2) * 240 + Math.random() * 320 - 80;
    pts.push(Math.round(v));
  }
  pts[pts.length - 1] = 45250;
  return pts;
})();

export const FAQ_HOME = [
  { q: "Is TEFAMA free to use?", a: "Yes — the core features are free forever. No credit card required. We offer a Pro plan for power users who want higher budgets, more agents, and advanced analytics." },
  { q: "Does TEFAMA ever touch my private keys?", a: "Never. We use zkLogin, which means you sign in with Google and your keys stay on your device. TEFAMA receives a scoped delegation — it can trade within your limits, and nothing else." },
  { q: "What happens if an agent loses money?", a: "The agent can only spend its budget. If the budget runs out, the agent stops automatically. You can also revoke any agent at any time with a single tap." },
  { q: "Which protocols does TEFAMA support?", a: "We currently support Deepbook (native Sui order book) for spot trading. Cetus, Turbos, and more are coming soon." },
];

export const usd = (n: number, d = 2) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (n: number, d = 1) => (n >= 0 ? "+" : "") + n.toFixed(d) + "%";
export const signedUsd = (n: number) => (n >= 0 ? "+" : "−") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
