# TEFAMA Contracts

A Move policy object on Sui that grants an AI agent a capped, expiring budget,
with an on-chain activity log and owner revocation. The agent autonomously
executes trades on DeepBook, and the vault enforces the ceiling on chain.

Status: deployed to Sui testnet and proven end to end. An autonomous agent has
executed a real, budget-capped DeepBook trade through the vault, and the budget
ceiling, expiry, activity log, and owner revocation are all enforced and
demonstrated on chain.

## Layout

- `sources/vault.move` — the whole contract: budget, allowlist, expiry, revocation, the `request_trade` / `settle_trade` pair, and events. No external dependencies.
- `client/config.ts` — runtime config, all values from env.
- `client/execute.ts` — one capped trade (request_trade -> DeepBook swap -> settle_trade).
- `client/runner.ts` — autonomous DCA loop that self-halts when the vault stops it.
- `client/integration.ts` — live testnet test: capped trade, over-budget rejection, revocation.
- `Move.toml` / `Move.lock` — pinned build.

On-chain identity is the Move package `tefama` (module `tefama::vault`).

## Map to the sub-track must-haves

- Self-enforced ceiling: `vault::charge` debits a cumulative window budget in Move; off-chain code cannot exceed it.
- Real DeepBook order: the agent composes a live `deepbook::pool` swap between `request_trade` and `settle_trade` in one PTB.
- On-chain activity log: `VaultCreated`, `Charged`, `TradeRequested`, `TradeSettled`, and revocation events.
- Owner revocation: `vault::remove_agent` (allowlist) and `vault::set_paused` (kill switch), both cap-gated.
- Expires: `expires_at_ms`, checked on every charge.

## How it works

The Move package does not depend on DeepBook at compile time. Every trade still routes through the live DeepBook pool, but the swap happens in the agent's transaction rather than inside the contract. The vault exposes a hot-potato pair:

- `request_trade` debits the budget and returns the Quote coin plus a `TradeReceipt` that has no abilities, so it must be consumed in the same transaction.
- The agent runtime composes a real DeepBook swap in the PTB, then calls `settle_trade`, which returns the proceeds and any unspent Quote to the vault and enforces the slippage floor.

Because DeepBook is called from the transaction and not linked into the contract, the package has no dependency on a specific DeepBook package version, which removes a whole class of upgrade and linkage failures. The hot potato still forces funds back into the vault. The on-chain guarantee is the spend ceiling per window plus the hard expiry. Protocol scope (that the swap targets DeepBook specifically) is enforced by the agent runtime plus the slippage floor, not by the Move contract.

The reference deployment trades the vault's Quote (SUI) for Base (DEEP) on the whitelisted DEEP/SUI pool, which is fee-free so the agent passes a zero DEEP coin.

## Build and test

```
cd contracts
sui move build
sui move test
```

13 unit tests pass: budget ceiling, cumulative fragmentation, window reset,
expiry, allowlist, revocation, pause, owner withdraw, settlement helpers, and
the request_trade / settle_trade path including the slippage floor.

## Deployed on testnet

| Item | Value |
|---|---|
| Package | `0xf8cfd942cfe8332f0d98e3dbab38d26c3ea641531010e1bbf06e45c0199d97a1` |
| Vault (shared) | `0x499bbf18beaaedd285bfd2b074c4d8951c74318e45596b5e478f4b38cbc90293` |
| OwnerCap | `0xa19faf8d44915a350ebc81ad4bbd2337a243194bfbbeb535e90be30539bf3cc1` |
| Quote / Base | SUI `0x2::sui::SUI` / DEEP `0x36dbef...::deep::DEEP` |
| DeepBook pool | DEEP/SUI `0x48c95963e9eac37a316b7ae04a0deb761bcdcc2b67912374d6036e7f0e9bae9f` |

Proof transactions:

| Action | Events | Digest |
|---|---|---|
| Create vault (budget 0.5 SUI, 24h expiry) | `VaultCreated` | `6EbvTvc66WAUVW2QXTaH4co9GsHJmMkboQoUJraP5G7f` |
| Agent capped DeepBook trade | `Charged`, `TradeRequested`, `TradeSettled` | `HauYqnFifMDBHqtEnTbcUfdFwSU7S5jGnAeQCEyweuWj` |

Inspect any of them:

```
sui client tx-block <digest>
```

View the agent trade on an explorer: https://suiscan.xyz/testnet/tx/HauYqnFifMDBHqtEnTbcUfdFwSU7S5jGnAeQCEyweuWj

## Run the agent

```
cd client && npm install
cp .env.example .env   # fill in package, vault, pool, types, AGENT_SECRET_KEY
npx tsx execute.ts 190000000   # one capped trade
npx tsx runner.ts              # autonomous DCA loop; stops itself when the vault does
```

## Integration test (live testnet)

Drives the real path and asserts what unit tests cannot: a capped trade
succeeds, an over-budget trade is rejected, and a revoked agent is rejected.
Needs `OWNER_SECRET_KEY` and `CAP_ID` in `.env`.

```
cd client
npx tsx integration.ts
```

## Demo: revocation

Owner pauses the vault at any time; the next agent trade aborts on chain.

```
sui client call --package <PackageID> --module vault --function set_paused \
  --type-args 0x2::sui::SUI 0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP \
  --args <VaultID> <OwnerCap> true --gas-budget 20000000
```

`remove_agent` revokes the same way via the allowlist.

## Notes

- One vault maps to one DeepBook pool, so vaults are single-pair by design.
- The agent's scoped key must be allowlisted via `vault::add_agent` and is never the owner key.
