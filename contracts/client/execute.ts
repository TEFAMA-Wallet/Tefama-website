import "dotenv/config";
import { Transaction } from "@mysten/sui/transactions";
import { cfg, client, agent, agentAddress } from "./config.js";

export async function executeTrade(amount: bigint, minBaseOut: bigint = 0n) {
  const tx = new Transaction();

  const [quoteCoin, receipt] = tx.moveCall({
    target: `${cfg.packageId}::vault::request_trade`,
    typeArguments: [cfg.quoteType, cfg.baseType],
    arguments: [
      tx.object(cfg.vaultId),
      tx.pure.u64(amount),
      tx.pure.u64(minBaseOut),
      tx.object(cfg.clockId),
    ],
  });

  const deepFee = tx.moveCall({ target: "0x2::coin::zero", typeArguments: [cfg.deepType] });
  const [base, quoteLeft, deepLeft] = tx.moveCall({
    target: `${cfg.deepbookPkg}::pool::swap_exact_quote_for_base`,
    typeArguments: [cfg.baseType, cfg.quoteType], // Pool<Base, Quote>
    arguments: [
      tx.object(cfg.poolId),
      quoteCoin,
      deepFee,
      tx.pure.u64(1),
      tx.object(cfg.clockId),
    ],
  });

  tx.moveCall({
    target: `${cfg.packageId}::vault::settle_trade`,
    typeArguments: [cfg.quoteType, cfg.baseType],
    arguments: [tx.object(cfg.vaultId), receipt, base, quoteLeft],
  });

  tx.transferObjects([deepLeft], agentAddress);

  const res = await client.signAndExecuteTransaction({
    signer: agent,
    transaction: tx,
    options: { showEffects: true, showEvents: true },
  });
  await client.waitForTransaction({ digest: res.digest });

  const status = res.effects?.status.status;
  console.log(`agent ${agentAddress}`);
  console.log(`digest ${res.digest} -> ${status}`);
  if (status !== "success") {
    console.error("aborted:", res.effects?.status.error);
    return res;
  }
  for (const e of res.events ?? []) {
    if (e.type.includes("::vault::")) {
      console.log(e.type.split("::").pop(), JSON.stringify(e.parsedJson));
    }
  }
  return res;
}

if (process.argv[1] && process.argv[1].endsWith("execute.ts")) {
  const amount = BigInt(process.argv[2] ?? process.env.TRADE_AMOUNT ?? "190000000");
  const minOut = BigInt(process.argv[3] ?? "0");
  executeTrade(amount, minOut).catch((e) => { console.error(e); process.exit(1); });
}