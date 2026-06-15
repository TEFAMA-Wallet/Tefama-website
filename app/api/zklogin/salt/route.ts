import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SALT_SECRET = process.env.ZKLOGIN_SALT_SECRET;

export async function POST(req: NextRequest) {
  const { token } = (await req.json()) as { token: string };

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  if (!SALT_SECRET) {
    return NextResponse.json(
      { error: "ZKLOGIN_SALT_SECRET is not set" },
      { status: 500 }
    );
  }

  // Extract the sub claim (user's permanent Google ID) from the JWT payload.
  // Full JWT verification is not needed here — the ZK proof verifies the JWT.
  const [, payloadB64] = token.split(".");
  const { sub } = JSON.parse(
    Buffer.from(payloadB64, "base64url").toString("utf8")
  ) as { sub: string };

  if (!sub) {
    return NextResponse.json({ error: "No sub in JWT" }, { status: 400 });
  }

  // Derive a deterministic 128-bit salt from (secret, sub).
  // Same Google account → same salt → same Sui address, every time.
  const hmac = createHmac("sha256", SALT_SECRET).update(sub).digest("hex");
  const salt = (BigInt("0x" + hmac) % 2n ** 128n).toString();

  return NextResponse.json({ salt });
}
