"use client";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  href?: string;
  wordSize?: number;
  mark?: boolean;
  priority?: boolean;
}

export default function Logo({ href = "/", wordSize, mark = true, priority }: LogoProps) {
  return (
    <Link href={href} className="logo-lockup">
      {mark && (
        <Image
          src="/logo-mark.png"
          alt="TEFAMA"
          width={30}
          height={30}
          style={{ objectFit: "contain" }}
          priority={priority}
        />
      )}
      <span className="logo-word" style={wordSize ? { fontSize: wordSize } : undefined}>
        TEFAMA
      </span>
    </Link>
  );
}
