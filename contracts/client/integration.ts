import "dotenv/config";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { cfg, client, agentAddress } from "./config.js";
import { executeTrade } from "./execute.js";

const owner = Ed25519Keypair.fromSecretKey(process.env.OWNER_SECRET_KEY!);
const CAP = process.env.CAP_ID!; // OwnerCap id

let pass = 0, fail = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  ok ? pass++ : fail++;
}

async function setPaused(paused: boolean) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${cfg.packageId}::vault::set_paused`,
    typeArguments: [cfg.quoteType, cfg.baseType],
    arguments: [tx.object(cfg.vaultId), tx.object(CAP), tx.pure.bool(paused)],
  });
  const res = await client.signAndExecuteTransaction({ signer: owner, transaction: tx, options: { showEffects: true } });
  await client.waitForTransaction({ digest: res.digest });
  return res.effects?.status.status === "success";
}

async function main() {
  console.log(`agent ${agentAddress}`);

  // A) a capped trade within budget succeeds
  const a = await executeTrade(190_000_000n, 0n).catch((e: unknown) => ({ thrown: String(e) } as any));
  check("A: capped trade succeeds", a.effects?.status.status === "success", a.thrown ?? "");

  // B) an over-budget trade is rejected on chain (abort code 3 = EOverBudget)
  const b = await executeTrade(10_000_000_000n, 0n).catch((e: unknown) => ({ thrown: String(e) } as any));
  const bRejected = !!b.thrown || b.effects?.status.status === "failure";
  check("B: over-budget trade rejected", bRejected);

  // C) owner revokes (pause), then the agent trade is rejected (abort code 2 = EPaused)
  await setPaused(true);
  const c = await executeTrade(190_000_000n, 0n).catch((e: unknown) => ({ thrown: String(e) } as any));
  const cRejected = !!c.thrown || c.effects?.status.status === "failure";
  check("C: revoked agent rejected", cRejected);
  await setPaused(false); // restore for reruns

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });