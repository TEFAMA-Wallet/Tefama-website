import { NextRequest, NextResponse } from "next/server";

const PROVER_URL =
  process.env.PROVER_URL ?? "https://prover-dev.mystenlabs.com/v1";

interface ProverBody {
  jwt: string;
  extendedEphemeralPublicKey: string;
  maxEpoch: number;
  jwtRandomness: string;
  salt: string;
  keyClaimName: "sub";
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<ProverBody>;
  const { jwt, extendedEphemeralPublicKey, maxEpoch, jwtRandomness, salt, keyClaimName } = body;

  if (
    !jwt ||
    !extendedEphemeralPublicKey ||
    maxEpoch === undefined ||
    !jwtRandomness ||
    !salt ||
    keyClaimName !== "sub"
  ) {
    return NextResponse.json(
      { error: "Missing or invalid proof request fields" },
      { status: 400 }
    );
  }

  const upstream = await fetch(PROVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jwt,
      extendedEphemeralPublicKey,
      maxEpoch,
      jwtRandomness,
      salt,
      keyClaimName,
    }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(data);
}
