/**
 * One-shot setup: creates a vault, allowlists the agent, deposits SUI.
 * Run once: npx tsx setup.ts
 */
import "dotenv/config";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const NETWORK   = "testnet";
const PKG_ID    = "0xf8cfd942cfe8332f0d98e3dbab38d26c3ea641531010e1bbf06e45c0199d97a1";
const CLOCK_ID  = "0x6";
const SUI_TYPE  = "0x2::sui::SUI";
const DEEP_TYPE = "0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP";

// Owner key (pays gas, becomes vault owner)
const OWNER_KEY  = process.env.OWNER_SECRET_KEY!;
// Agent address to allowlist
const AGENT_ADDR = process.env.AGENT_ADDRESS!;
// How much SUI to deposit into vault (in MIST, 1 SUI = 1_000_000_000)
const DEPOSIT    = BigInt(process.env.DEPOSIT_MIST ?? "200000000"); // 0.2 SUI default
// Budget cap per 24h window (in MIST)
const BUDGET     = BigInt(process.env.BUDGET_MIST  ?? "500000000"); // 0.5 SUI default
// Window duration = 24h in ms
const WINDOW_MS  = BigInt(86_400_000);
// Total duration = 30 days in ms
const DURATION_MS = BigInt(30 * 86_400_000);

async function main() {
  if (!OWNER_KEY)  throw new Error("Set OWNER_SECRET_KEY in .env");
  if (!AGENT_ADDR) throw new Error("Set AGENT_ADDRESS in .env");

  const client = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(NETWORK), network: NETWORK });
  const owner  = Ed25519Keypair.fromSecretKey(OWNER_KEY);
  const ownerAddr = owner.toSuiAddress();

  console.log("Owner address:", ownerAddr);
  console.log("Agent address:", AGENT_ADDR);

  // Step 1: create vault + get OwnerCap
  console.log("\n[1/3] Creating vault...");
  const createTx = new Transaction();
  createTx.moveCall({
    target: `${PKG_ID}::vault::create`,
    typeArguments: [SUI_TYPE, DEEP_TYPE],
    arguments: [
      createTx.pure.u64(BUDGET),
      createTx.pure.u64(WINDOW_MS),
      createTx.pure.u64(DURATION_MS),
      createTx.object(CLOCK_ID),
    ],
  });
  createTx.setGasBudget(20_000_000);

  const createRes = await client.signAndExecuteTransaction({
    signer: owner,
    transaction: createTx,
    options: { showEffects: true, showObjectChanges: true },
  });
  await client.waitForTransaction({ digest: createRes.digest });
  if (createRes.effects?.status.status !== "success") {
    throw new Error("Create vault failed: " + createRes.effects?.status.error);
  }

  // Extract vault and cap IDs from created objects
  const created = createRes.objectChanges?.filter((o: any) => o.type === "created") ?? [];
  const vaultObj = created.find((o: any) => o.objectType?.includes("::vault::Vault"));
  const capObj   = created.find((o: any) => o.objectType?.includes("::vault::OwnerCap"));
  if (!vaultObj || !capObj) throw new Error("Could not find vault or cap in created objects");

  const vaultId = (vaultObj as any).objectId;
  const capId   = (capObj as any).objectId;
  console.log("  Vault ID :", vaultId);
  console.log("  OwnerCap :", capId);
  console.log("  TX       :", createRes.digest);

  // Step 2: add agent to allowlist
  console.log("\n[2/3] Adding agent to allowlist...");
  const agentTx = new Transaction();
  agentTx.moveCall({
    target: `${PKG_ID}::vault::add_agent`,
    typeArguments: [SUI_TYPE, DEEP_TYPE],
    arguments: [
      agentTx.object(vaultId),
      agentTx.object(capId),
      agentTx.pure.address(AGENT_ADDR),
    ],
  });
  agentTx.setGasBudget(10_000_000);

  const agentRes = await client.signAndExecuteTransaction({
    signer: owner,
    transaction: agentTx,
    options: { showEffects: true },
  });
  await client.waitForTransaction({ digest: agentRes.digest });
  if (agentRes.effects?.status.status !== "success") {
    throw new Error("Add agent failed: " + agentRes.effects?.status.error);
  }
  console.log("  TX:", agentRes.digest);

  // Step 3: deposit SUI into vault
  console.log("\n[3/3] Depositing SUI into vault...");
  const depositTx = new Transaction();
  const [coin] = depositTx.splitCoins(depositTx.gas, [depositTx.pure.u64(DEPOSIT)]);
  depositTx.moveCall({
    target: `${PKG_ID}::vault::deposit_quote`,
    typeArguments: [SUI_TYPE, DEEP_TYPE],
    arguments: [depositTx.object(vaultId), coin],
  });
  depositTx.setGasBudget(10_000_000);

  const depositRes = await client.signAndExecuteTransaction({
    signer: owner,
    transaction: depositTx,
    options: { showEffects: true },
  });
  await client.waitForTransaction({ digest: depositRes.digest });
  if (depositRes.effects?.status.status !== "success") {
    throw new Error("Deposit failed: " + depositRes.effects?.status.error);
  }
  console.log("  TX:", depositRes.digest);

  console.log("\n✅ Setup complete! Add these to your .env.local and Vercel:");
  console.log(`VAULT_ID=${vaultId}`);
  console.log(`CAP_ID=${capId}`);
  console.log(`AGENT_ADDRESS=${AGENT_ADDR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
