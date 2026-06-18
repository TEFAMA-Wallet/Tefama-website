import { NextRequest, NextResponse } from "next/server";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const NETWORK    = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as "testnet" | "mainnet";
const PKG_ID     = process.env.TEFAMA_PACKAGE_ID ?? "";
const VAULT_ID   = process.env.VAULT_ID ?? "";
const DB_PKG     = process.env.DEEPBOOK_PKG ?? "0x22be4cade64bf2d02412c7e8d0e8beea2f78828b948118d46735315409371a3c";
const POOL_ID    = process.env.POOL_ID ?? "0x48c95963e9eac37a316b7ae04a0deb761bcdcc2b67912374d6036e7f0e9bae9f";
const MANAGER_ID = process.env.BALANCE_MANAGER_ID ?? "";
const QUOTE_TYPE = process.env.QUOTE_TYPE ?? "0x2::sui::SUI";
const BASE_TYPE  = process.env.BASE_TYPE  ?? "0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP";
const CLOCK_ID   = "0x6";

// 0.3 SUI per DCA trade clip — covers DEEP_SUI min order (10 DEEP × ~0.023 SUI each)
const DCA_CLIP = BigInt(process.env.DCA_CLIP ?? "300000000");

// DEEP_SUI pool constants (from pool book object)
const LOT_SIZE = BigInt(1_000_000);   // 1 DEEP  (6 decimals)
const MIN_SIZE = BigInt(10_000_000);  // 10 DEEP minimum order

const INDEXER = "https://deepbook-indexer.testnet.mystenlabs.com";

function authorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return auth === `Bearer ${secret}`;
}

interface PriceInfo {
  price: number;       // SUI/USD
  low24h: number;
  deepSuiPrice: number; // DEEP per SUI
}

async function getPrice(): Promise<PriceInfo> {
  const res = await fetch(`${INDEXER}/summary`, { cache: "no-store" });
  const data = await res.json();
  const pairs: Record<string, any> = Array.isArray(data)
    ? Object.fromEntries(data.map((p: any) => [p.trading_pair, p]))
    : data;

  const suiPair  = pairs["SUI_DBUSDC"] ?? {};
  const deepPair = pairs["DEEP_SUI"]   ?? {};

  const price      = Number(suiPair?.last_price ?? 0);
  const low24h     = Number(suiPair?.low_price ?? suiPair?.lowest_price_24h ?? 0);
  // deepPair: DEEP is base, SUI is quote → last_price = SUI per DEEP (e.g. 0.023)
  const suiPerDeep   = Number(deepPair?.last_price ?? 0.023);
  const deepSuiPrice = suiPerDeep > 0 ? 1 / suiPerDeep : 40; // DEEP per 1 SUI

  return { price, low24h, deepSuiPrice };
}

// Compute quantity in raw DEEP units, aligned to lot_size, capped to what SUI budget can afford.
function calcDeepQuantity(deepSuiPrice: number): bigint {
  const suiAmount = Number(DCA_CLIP) / 1e9;
  // Use 70% of SUI to avoid running over budget (price may have moved)
  const rawDeep = suiAmount * deepSuiPrice * 0.7 * 1_000_000; // DEEP raw units
  // Round down to nearest lot_size
  const lots = BigInt(Math.floor(rawDeep)) / LOT_SIZE;
  const quantity = lots * LOT_SIZE;
  return quantity < MIN_SIZE ? MIN_SIZE : quantity;
}

async function executeDCA(
  suiClient: SuiJsonRpcClient,
  agentKeypair: Ed25519Keypair,
  deepSuiPrice: number,
): Promise<string> {
  if (!MANAGER_ID) throw new Error("BALANCE_MANAGER_ID not set — run contracts/client/setup-balance-manager.ts first");

  const deepUnits = calcDeepQuantity(deepSuiPrice);

  const tx = new Transaction();
  tx.setSender(agentKeypair.toSuiAddress());

  // 1. Request SUI from vault (hot-potato receipt must be settled in same PTB)
  const [quoteCoin, receipt] = tx.moveCall({
    target: `${PKG_ID}::vault::request_trade`,
    typeArguments: [QUOTE_TYPE, BASE_TYPE],
    arguments: [
      tx.object(VAULT_ID),
      tx.pure.u64(DCA_CLIP),
      tx.pure.u64(0), // min_base_out: 0
      tx.object(CLOCK_ID),
    ],
  });

  // 2. Deposit vault SUI into our BalanceManager
  tx.moveCall({
    target: `${DB_PKG}::balance_manager::deposit`,
    typeArguments: [QUOTE_TYPE],
    arguments: [tx.object(MANAGER_ID), quoteCoin],
  });

  // 3. Generate trade proof as owner (agent wallet owns the BalanceManager)
  const tradeProof = tx.moveCall({
    target: `${DB_PKG}::balance_manager::generate_proof_as_owner`,
    arguments: [tx.object(MANAGER_ID)],
  });

  // 4. Place a market buy for DEEP.
  //    quantity must be a multiple of lot_size (1 DEEP) and >= min_size (10 DEEP).
  //    isBid=true: paying SUI to receive DEEP.
  tx.moveCall({
    target: `${DB_PKG}::pool::place_market_order`,
    typeArguments: [BASE_TYPE, QUOTE_TYPE],
    arguments: [
      tx.object(POOL_ID),
      tx.object(MANAGER_ID),
      tradeProof,
      tx.pure.u64(0),          // client_order_id
      tx.pure.u8(0),           // self_matching_option: SELF_MATCHING_ALLOWED
      tx.pure.u64(deepUnits),  // quantity (DEEP raw, must be ≥ 10,000,000)
      tx.pure.bool(true),      // is_bid: buying DEEP with SUI
      tx.pure.bool(false),     // pay_with_deep: false (fee from SUI; pool is fee-free)
      tx.object(CLOCK_ID),
    ],
  });

  // 5. Withdraw all DEEP received from BalanceManager
  const baseCoin = tx.moveCall({
    target: `${DB_PKG}::balance_manager::withdraw_all`,
    typeArguments: [BASE_TYPE],
    arguments: [tx.object(MANAGER_ID)],
  });

  // 6. Withdraw remaining SUI (unspent due to partial fill or lot rounding)
  const quoteLeftover = tx.moveCall({
    target: `${DB_PKG}::balance_manager::withdraw_all`,
    typeArguments: [QUOTE_TYPE],
    arguments: [tx.object(MANAGER_ID)],
  });

  // 7. Settle: return DEEP + unused SUI to vault → emits TradeSettled event
  tx.moveCall({
    target: `${PKG_ID}::vault::settle_trade`,
    typeArguments: [QUOTE_TYPE, BASE_TYPE],
    arguments: [tx.object(VAULT_ID), receipt, baseCoin, quoteLeftover],
  });

  tx.setGasBudget(100_000_000);

  const res = await suiClient.signAndExecuteTransaction({
    signer: agentKeypair,
    transaction: tx,
    options: { showEffects: true, showEvents: true },
  });

  await suiClient.waitForTransaction({ digest: res.digest });
  if (res.effects?.status.status !== "success") {
    throw new Error(`TX failed: ${res.effects?.status.error}`);
  }
  return res.digest;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!PKG_ID || !VAULT_ID) {
    return NextResponse.json({ skipped: true, reason: "Agent not configured — set TEFAMA_PACKAGE_ID and VAULT_ID env vars" });
  }

  const agentSecret = process.env.AGENT_SECRET_KEY;
  if (!agentSecret) {
    return NextResponse.json({ skipped: true, reason: "AGENT_SECRET_KEY not set" });
  }

  if (!MANAGER_ID) {
    return NextResponse.json({ skipped: true, reason: "BALANCE_MANAGER_ID not set — run setup-balance-manager.ts" });
  }

  try {
    const { price, low24h, deepSuiPrice } = await getPrice();

    // DCA strategy: buy unless price is >5% above 24h low
    if (low24h > 0 && price > low24h * 1.05) {
      return NextResponse.json({ skipped: true, reason: `Price ${price} too high vs 24h low ${low24h}`, price });
    }

    const suiClient    = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(NETWORK), network: NETWORK });
    const agentKeypair = Ed25519Keypair.fromSecretKey(agentSecret);
    const digest       = await executeDCA(suiClient, agentKeypair, deepSuiPrice);

    return NextResponse.json({ success: true, digest, price, strategy: "DCA" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("EOverBudget") || msg.includes("EPaused") || msg.includes("EExpired")) {
      return NextResponse.json({ skipped: true, reason: msg });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
