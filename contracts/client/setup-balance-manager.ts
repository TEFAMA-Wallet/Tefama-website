/**
 * One-time setup: creates a DeepBook BalanceManager owned by the agent wallet.
 * Run once, save the printed BALANCE_MANAGER_ID to your .env.local
 *
 *   cd contracts/client && npx tsx setup-balance-manager.ts
 */
import "dotenv/config";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const NETWORK  = (process.env.SUI_NETWORK ?? "testnet") as "testnet" | "mainnet";
const DB_PKG   = process.env.DEEPBOOK_PKG ?? "0x22be4cade64bf2d02412c7e8d0e8beea2f78828b948118d46735315409371a3c";
const AGENT_SK = process.env.AGENT_SECRET_KEY ?? "";

if (!AGENT_SK) { console.error("AGENT_SECRET_KEY not set"); process.exit(1); }

const client  = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(NETWORK), network: NETWORK });
const keypair = Ed25519Keypair.fromSecretKey(AGENT_SK);
const agent   = keypair.toSuiAddress();

console.log("Agent address:", agent);
console.log("Creating BalanceManager...");

const tx = new Transaction();

// Create a shared BalanceManager — the agent owns it so it can generate_proof_as_owner
const manager = tx.moveCall({
  target: `${DB_PKG}::balance_manager::new`,
});

// Share it so it can be accessed in PTBs
tx.moveCall({
  target: "0x2::transfer::public_share_object",
  arguments: [manager],
  typeArguments: [`${DB_PKG}::balance_manager::BalanceManager`],
});

tx.setGasBudget(50_000_000);
tx.setSender(agent);

const res = await client.signAndExecuteTransaction({
  signer: keypair,
  transaction: tx,
  options: { showEffects: true, showObjectChanges: true },
});

await client.waitForTransaction({ digest: res.digest });

if (res.effects?.status.status !== "success") {
  console.error("TX failed:", res.effects?.status.error);
  process.exit(1);
}

// Find the created BalanceManager object
const created = (res.objectChanges ?? []).filter((o: any) => o.type === "created" && (o as any).objectType?.includes("BalanceManager"));
const managerId = (created[0] as any)?.objectId;

console.log("\n✅ BalanceManager created!");
console.log("   BALANCE_MANAGER_ID =", managerId);
console.log("\nAdd to .env.local and Vercel env vars:");
console.log(`BALANCE_MANAGER_ID=${managerId}`);
console.log("\nTX:", res.digest);
