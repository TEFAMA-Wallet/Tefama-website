import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
  decodeJwt,
} from "@mysten/sui/zklogin";
import {
  saveEphemeral,
  clearEphemeral,
  loadEphemeral,
  type ZkProofData,
} from "./zklogin-store";

type SuiNetwork = "testnet" | "mainnet" | "devnet" | "localnet";

const NETWORK =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as SuiNetwork | undefined) ?? "testnet";

export const suiClient = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl(NETWORK),
  network: NETWORK,
});

export async function buildGoogleLoginUrl(
  clientId: string,
  redirectUri: string
): Promise<string> {
  const keypair = new Ed25519Keypair();
  const systemState = await suiClient.getLatestSuiSystemState();
  const maxEpoch = Number(systemState.epoch) + 10;
  const randomness = generateRandomness();
  const nonce = generateNonce(keypair.getPublicKey(), maxEpoch, randomness);

  saveEphemeral({
    secretKey: keypair.getSecretKey(),
    maxEpoch,
    randomness: randomness.toString(),
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "id_token",
    scope: "openid email profile",
    nonce,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function getSalt(jwt: string): Promise<string> {
  const res = await fetch("/api/zklogin/salt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: jwt }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Salt service error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { salt: string };
  return data.salt;
}

async function fetchZkProof(
  jwt: string,
  extendedEphemeralPublicKey: string,
  maxEpoch: number,
  randomness: string,
  salt: string
): Promise<ZkProofData> {
  const res = await fetch("/api/zklogin/proof", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jwt,
      extendedEphemeralPublicKey,
      maxEpoch,
      jwtRandomness: randomness,
      salt,
      keyClaimName: "sub",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Prover service error ${res.status}: ${text}`);
  }
  return res.json() as Promise<ZkProofData>;
}

export interface LoginResult {
  address: string;
  email: string;
  name: string;
  picture: string;
  salt: string;
  maxEpoch: number;
  secretKey: string;
  zkProof: ZkProofData;
}

export async function completeLogin(jwt: string): Promise<LoginResult> {
  const ephemeral = loadEphemeral();
  if (!ephemeral) {
    throw new Error("Session expired — please start login again.");
  }

  const keypair = Ed25519Keypair.fromSecretKey(ephemeral.secretKey);
  const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
    keypair.getPublicKey()
  );

  const salt = await getSalt(jwt);
  const zkProof = await fetchZkProof(
    jwt,
    extendedEphemeralPublicKey,
    ephemeral.maxEpoch,
    ephemeral.randomness,
    salt
  );

  const address = jwtToAddress(jwt, salt, false);
  const claims = decodeJwt(jwt) as Record<string, unknown>;

  clearEphemeral();

  return {
    address,
    email: (claims.email as string) ?? "",
    name: (claims.name as string) ?? "",
    picture: (claims.picture as string) ?? "",
    salt,
    maxEpoch: ephemeral.maxEpoch,
    secretKey: ephemeral.secretKey,
    zkProof,
  };
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
