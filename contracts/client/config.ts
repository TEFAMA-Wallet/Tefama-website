import "dotenv/config";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

function need(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
}

export const cfg = {
  network: (process.env.SUI_NETWORK ?? "testnet") as "testnet" | "mainnet",
  packageId: need("TEFAMA_PACKAGE_ID"),
  vaultId: need("VAULT_ID"),
  deepbookPkg: need("DEEPBOOK_PKG"),
  poolId: need("POOL_ID"),
  quoteType: process.env.QUOTE_TYPE ?? "0x2::sui::SUI",
  baseType: need("BASE_TYPE"),
  deepType: need("DEEP_TYPE"),
  clockId: "0x6",
};

export const client = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl(cfg.network),
  network: cfg.network,
});

export const agent = Ed25519Keypair.fromSecretKey(need("AGENT_SECRET_KEY"));
export const agentAddress = agent.toSuiAddress();