export interface EphemeralData {
  secretKey: string;
  maxEpoch: number;
  randomness: string;
}

export interface ZkProofData {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
}

export interface ZkLoginSession {
  provider: "google";
  address: string;
  email: string;
  name: string;
  picture: string;
  salt: string;
  maxEpoch: number;
  secretKey: string;
  zkProof: ZkProofData;
  jwt: string;
}

const EPHEMERAL_KEY = "zkl_ephemeral";
const SESSION_KEY = "zkl_session";

export function saveEphemeral(data: EphemeralData): void {
  sessionStorage.setItem(EPHEMERAL_KEY, JSON.stringify(data));
}

export function loadEphemeral(): EphemeralData | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(EPHEMERAL_KEY);
  return raw ? (JSON.parse(raw) as EphemeralData) : null;
}

export function clearEphemeral(): void {
  sessionStorage.removeItem(EPHEMERAL_KEY);
}

export function saveSession(session: ZkLoginSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): ZkLoginSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as ZkLoginSession) : null;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(EPHEMERAL_KEY);
}
