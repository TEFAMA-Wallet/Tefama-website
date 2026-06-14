# TEFAMA — Autonomous Agent Wallet

TEFAMA lets you deploy AI agents that trade on the Sui blockchain autonomously, within budget limits you set and enforce on-chain. No seed phrases, no pop-up signing — just set a budget and let it run.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom CSS design system
- **Icons:** Lucide React
- **Blockchain:** Sui (zkLogin, Move policies, Deepbook)

## Project Structure

```
app/
├── (public)/          # Marketing pages (header + footer layout)
│   ├── page.tsx       # Home / landing
├── features/          # Features page
├── how-it-works/      # How it works
├── faq/               # FAQ
├── pricing/           # Pricing
├── connect/           # Wallet connect (zkLogin)
├── biometric/         # Biometric auth
├── verify-email/      # Email verification
└── (app)/             # Authenticated app shell (sidebar layout)
    ├── dashboard/     # Portfolio overview
    ├── agents/        # Agent list + create + detail
    ├── analytics/     # Portfolio analytics
    ├── activity/      # On-chain activity log
    ├── wallet/        # Token holdings
    └── settings/      # Account settings

components/
├── charts/            # AreaChart, Sparkline
├── layout/            # PublicHeader, Footer, Sidebar, TopBar
└── ui/                # Button, Card, Badge, Logo

lib/
└── data.ts            # Mock data and formatting utilities
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with hero, features, and CTA |
| `/features` | Full feature breakdown |
| `/how-it-works` | Step-by-step guide |
| `/faq` | Frequently asked questions |
| `/pricing` | Free / Pro / Enterprise plans |
| `/connect` | Sign in with Google or Apple via zkLogin |
| `/dashboard` | Portfolio value, active agents, recent trades |
| `/agents` | Manage all deployed agents |
| `/agents/new` | 4-step agent creation wizard |
| `/agents/[id]` | Agent detail — P&L, budget, execution history |
| `/analytics` | Portfolio performance charts and metrics |
| `/activity` | Full on-chain activity log |
| `/wallet` | Token balances and holdings |
| `/settings` | Notifications, security, and account settings |

## Design System

Dark-first UI with a warm orange brand palette:

- **Primary:** `#FF8C00` (orange)
- **Accent:** `#FFD700` (gold)
- **Danger:** `#FF5A1F` (ember)
- **Base surface:** `#0a0a0a`

All design tokens are defined as CSS custom properties in `app/globals.css`.
