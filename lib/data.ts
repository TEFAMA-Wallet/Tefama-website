export const FAQ_HOME = [
  {
    q: "Do I need a wallet or seed phrase to get started?",
    a: "No. TEFAMA uses Sui zkLogin — you sign in with your Google account and a wallet address is derived for you automatically. No browser extension, no seed phrase, no private key to manage.",
  },
  {
    q: "Can the agent spend more than I allow?",
    a: "No. The budget cap is enforced by the vault smart contract on-chain, not by TEFAMA's servers. The agent physically cannot withdraw or trade beyond the limit you set — the Move contract rejects any transaction that would exceed it.",
  },
  {
    q: "What does the agent actually do?",
    a: "It runs a Dollar-Cost Averaging strategy: every hour it checks the DEEP/SUI price on DeepBook and, if the price is within 5% of the 24-hour low, it places a market buy order using the vault's SUI budget. Every trade is recorded on-chain and visible in your activity log.",
  },
  {
    q: "What happens if I want to stop?",
    a: "You can pause or fully revoke the agent at any time from the Vault settings page. Pausing stops new trades immediately. Revoking removes the agent from the vault allowlist permanently. Your vault balance stays in the smart contract under your ownership — TEFAMA's servers have no access to it.",
  },
  {
    q: "Which exchange does TEFAMA trade on?",
    a: "DeepBook v3 — the native central-limit order book built into Sui. Trades are real on-chain fills against the DEEP/SUI pool, not simulated swaps.",
  },
  {
    q: "Is this on mainnet?",
    a: "The current deployment runs on Sui Testnet as part of the Sui Overflow hackathon. All tokens are testnet tokens with no real monetary value. Mainnet support is the next step after the hackathon.",
  },
];

export const usd = (n: number, d = 2) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (n: number, d = 1) => (n >= 0 ? "+" : "") + n.toFixed(d) + "%";
export const signedUsd = (n: number) => (n >= 0 ? "+" : "−") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
