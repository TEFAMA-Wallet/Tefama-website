import { executeTrade } from "./execute.js";

const CLIP = BigInt(process.env.DCA_CLIP ?? "190000000");      // SUI in (9dp)
const MIN_OUT = BigInt(process.env.DCA_MIN_OUT ?? "0");
const INTERVAL_MS = Number(process.env.DCA_INTERVAL_MS ?? "15000");

async function run() {
  console.log(`DCA start: ${CLIP} quote every ${INTERVAL_MS}ms`);
  for (;;) {
    try {
      const res = await executeTrade(CLIP, MIN_OUT);
      if (res.effects?.status.status !== "success") {
        console.log("vault stopped the agent (budget/expiry/revocation). halting.");
        break;
      }
    } catch (e) {
      console.error("execution halted:", e);
      break;
    }
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
}

run();