/**
 * Fund the vault with SUI so the agent can execute trades.
 * Each trade costs ~0.3 SUI (min order = 10 DEEP at ~0.023 SUI each).
 *
 * Run with the OWNER or AGENT secret key:
 *   cd contracts/client && npx tsx fund-vault.ts
 *
 * Set FUND_AMOUNT_SUI env var to override (default: 2 SUI)
 */
import "dotenv/config";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const NETWORK   = (process.env.SUI_NETWORK ?? "testnet") as "testnet" | "mainnet";
const PKG_ID    = process.env.TEFAMA_PACKAGE_ID ?? "";
const VAULT_ID  = process.env.VAULT_ID ?? "";
const QUOTE_TYPE = process.env.QUOTE_TYPE ?? "0x2::sui::SUI";
const BASE_TYPE  = process.env.BASE_TYPE  ?? "0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP";

// Use agent key by default (agent's SUI balance is 0.48 SUI, enough for a few trades)
const SECRET_KEY = process.env.AGENT_SECRET_KEY ?? "";
const FUND_AMOUNT_SUI = Number(process.env.FUND_AMOUNT_SUI ?? "1.0");
const FUND_AMOUNT_MIST = BigInt(Math.floor(FUND_AMOUNT_SUI * 1e9));

if (!SECRET_KEY || !PKG_ID || !VAULT_ID) {
  console.error("Missing AGENT_SECRET_KEY, TEFAMA_PACKAGE_ID, or VAULT_ID in .env.local");
  process.exit(1);
}

const client  = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(NETWORK), network: NETWORK });
const keypair = Ed25519Keypair.fromSecretKey(SECRET_KEY);
const sender  = keypair.toSuiAddress();

console.log("Sender:", sender);
console.log("Funding vault:", VAULT_ID);
console.log("Amount:", FUND_AMOUNT_SUI, "SUI");

const tx = new Transaction();
tx.setSender(sender);

// Split exact SUI coin from gas
const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(FUND_AMOUNT_MIST)]);

// Deposit into vault
tx.moveCall({
  target: `${PKG_ID}::vault::deposit_quote`,
  typeArguments: [QUOTE_TYPE, BASE_TYPE],
  arguments: [tx.object(VAULT_ID), suiCoin],
});

tx.setGasBudget(50_000_000);

const res = await client.signAndExecuteTransaction({
  signer: keypair,
  transaction: tx,
  options: { showEffects: true },
});

await client.waitForTransaction({ digest: res.digest });

if (res.effects?.status.status !== "success") {
  console.error("TX failed:", res.effects?.status.error);
  process.exit(1);
}

console.log(`\n✅ Deposited ${FUND_AMOUNT_SUI} SUI into vault`);
console.log("TX:", res.digest);
console.log("The agent can now execute ~", Math.floor(FUND_AMOUNT_SUI / 0.3), "trades (at ~0.3 SUI each)");
