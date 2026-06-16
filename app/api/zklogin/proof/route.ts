import { NextRequest, NextResponse } from "next/server";

const PROVER_URL =
  process.env.NEXT_PUBLIC_PROVER_URL ?? "https://prover-dev.mystenlabs.com/v1";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;

  const upstream = await fetch(PROVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(data);
}
