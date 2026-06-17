import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SALT_SECRET = process.env.ZKLOGIN_SALT_SECRET;
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const VALID_ISSUERS = new Set([
  "accounts.google.com",
  "https://accounts.google.com",
]);

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { token?: string };

  if (!body.token || typeof body.token !== "string") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  if (!SALT_SECRET) {
    return NextResponse.json(
      { error: "ZKLOGIN_SALT_SECRET is not configured" },
      { status: 500 }
    );
  }

  const parts = body.token.split(".");
  if (parts.length !== 3) {
    return NextResponse.json({ error: "Malformed JWT" }, { status: 400 });
  }

  let payload: { sub?: string; iss?: string; aud?: string | string[]; exp?: number };
  try {
    payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as { sub?: string; iss?: string; aud?: string | string[]; exp?: number };
  } catch {
    return NextResponse.json({ error: "Could not decode JWT payload" }, { status: 400 });
  }

  if (!payload.iss || !VALID_ISSUERS.has(payload.iss)) {
    return NextResponse.json({ error: "Invalid JWT issuer" }, { status: 400 });
  }

  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud ?? ""];
  if (CLIENT_ID && !aud.includes(CLIENT_ID)) {
    return NextResponse.json({ error: "JWT audience mismatch" }, { status: 400 });
  }

  if (!payload.exp || Date.now() / 1000 > payload.exp) {
    return NextResponse.json({ error: "JWT has expired" }, { status: 400 });
  }

  if (!payload.sub) {
    return NextResponse.json({ error: "JWT missing sub claim" }, { status: 400 });
  }

  const hmac = createHmac("sha256", SALT_SECRET).update(payload.sub).digest("hex");
  const salt = (BigInt("0x" + hmac) % BigInt(2) ** BigInt(128)).toString();

  return NextResponse.json({ salt });
}
