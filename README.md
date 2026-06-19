# TEFAMA — Autonomous Agent Wallet

> **Sui Overflow Hackathon · Track 2: Autonomous Agent Wallet**

TEFAMA is a self-custodial AI agent wallet on Sui. Sign in with Google, set a budget, and a fully autonomous DCA agent starts trading on DeepBook — no seed phrases, no signing pop-ups, no human in the loop. Every action is enforced and logged on-chain.

---

## The Problem

AI agents are stuck at the "approve" wall. Every trade, every action requires a human signature. This makes autonomous DeFi strategies impossible — the agent has to ask permission for everything, defeating the purpose of automation.

## Our Solution

We give an AI agent a **Move-enforced budget policy** as its wallet. The agent can spend up to a daily cap, on a specific protocol, within an expiry window — all guaranteed by the contract, not by trusting the agent. The owner can pause or revoke at any time. The agent never touches more than it's allowed.

---

## Track 2 Requirements — How We Meet Them

| Requirement | Implementation |
|---|---|
| **Real DeepBook orders** | `place_market_order` via BalanceManager fills live taker bids against the DEEP/SUI order book on testnet |
| **Self-enforced budget ceiling** | `vault.move` hot-potato pattern: `request_trade` debits budget atomically, `settle_trade` must return DEEP + leftover SUI in the same PTB — budget can never be exceeded |
| **On-chain activity log** | `TradeSettled` and `Charged` events emitted per trade, indexed and shown in the activity feed |
| **Owner revocation** | `set_paused` and `remove_agent` callable by the OwnerCap holder at any time, demonstrated in the UI |

---

## Architecture

```
User (Google OAuth)
      │
      ▼
  zkLogin ──► derived wallet address (no seed phrase)
      │
      ▼
  Vault.move (Move object on Sui)
  ┌─────────────────────────────────────────┐
  │  budget_cap: 0.5 SUI / 24h window       │
  │  agents: [agent_address]                │
  │  quote_balance: SUI                     │
  │  base_balance: DEEP                     │
  └─────────────────────────────────────────┘
      │
      ▼ (every cron tick)
  Agent API Route (Next.js serverless)
      │
      ├─ request_trade()  → Coin<SUI> + TradeReceipt (hot potato)
      ├─ deposit into BalanceManager
      ├─ place_market_order() on DeepBook DEEP/SUI pool
      ├─ withdraw_all DEEP + leftover SUI
      └─ settle_trade()   → returns DEEP + SUI to vault, emits TradeSettled
```

**The hot-potato receipt makes under/overspend impossible at the contract level.** If `settle_trade` is never called, the PTB fails and the vault is untouched.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript |
| Auth | Sui zkLogin (Google OAuth — no wallet extension) |
| Smart contract | Move on Sui testnet |
| DEX | DeepBook v3 — BalanceManager `place_market_order` |
| Prices | DeepBook Indexer REST API |
| Deployment | Vercel (frontend + serverless agent cron) |

---

## Key On-Chain Components

**`vault.move`** — The budget policy object. Holds SUI and DEEP balances, tracks daily spend window, enforces agent allowlist. Owner controls via `OwnerCap`.

**DeepBook BalanceManager** — Agent's trading account on DeepBook. Owned by the agent keypair so `generate_proof_as_owner` works without a TradeCap.

**DCA Strategy** — Buys DEEP with SUI when price is within 5% of the 24h low. Skips when price is elevated. Executes via Vercel cron every hour.

---

## Features

- **zkLogin auth** — Sign in with Google, get a Sui wallet. No extensions, no seed phrases.
- **Autonomous DCA agent** — Trades DEEP/SUI on DeepBook every hour within the vault budget.
- **Real on-chain trades** — Live `OrderFilled` events on testnet, visible in activity log with Sui Explorer links.
- **Budget enforcement** — Daily cap set in Move. Agent physically cannot exceed it.
- **Notification bell** — Real-time feed of trade events, budget warnings, agent state changes.
- **Portfolio analytics** — Unrealised P&L, ROI, DEEP accumulated, portfolio allocation.
- **Owner controls** — Pause, revoke, or update the agent from the UI.

---

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.local.example` → `.env.local` and fill in your keys. See `contracts/client/` for setup scripts.

**Required env vars:**

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ZKLOGIN_SALT_SECRET=
TEFAMA_PACKAGE_ID=
VAULT_ID=
AGENT_SECRET_KEY=
BALANCE_MANAGER_ID=
DEEPBOOK_PKG=
POOL_ID=
QUOTE_TYPE=
BASE_TYPE=
```

---

## Contract Deployment

```bash
cd contracts
sui move build
sui client publish --gas-budget 200000000
```

One-time setup scripts in `contracts/client/`:
- `setup-balance-manager.ts` — creates the DeepBook BalanceManager for the agent
- `fund-vault.ts` — deposits SUI into the vault for trading budget

---

## Live Demo

Deployed on Vercel · Sui Testnet · DeepBook DEEP/SUI pool `0x48c95963…`

## Mobile App

The TEFAMA mobile companion app is available for Android and iOS:

**[github.com/TEFAMA-Wallet/Tefama-mobile](https://github.com/TEFAMA-Wallet/Tefama-mobile)**

Same Google zkLogin account — your vault and trades appear on both platforms instantly.
