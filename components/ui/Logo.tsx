"use client";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  href?: string;
  wordSize?: number;
  mark?: boolean;
}

export default function Logo({ href = "/", wordSize, mark = true }: LogoProps) {
  return (
    <Link href={href} className="logo-lockup">
      {mark && <Image src="/logo-mark.png" alt="TEFAMA" width={28} height={28} style={{ objectFit: "contain" }} />}
      <span className="logo-word" style={wordSize ? { fontSize: wordSize } : undefined}>TEFAMA</span>
    </Link>
  );
}
