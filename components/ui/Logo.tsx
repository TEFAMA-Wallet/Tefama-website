"use client";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

interface LogoProps {
  href?: string;
  wordSize?: number;
  mark?: boolean;
  priority?: boolean;
}

export default function Logo({ href = "/", wordSize, mark = true, priority }: LogoProps) {
  const { theme } = useTheme();
  const src = theme === "light" ? "/logo-mark-light.png" : "/logo-mark.png";

  return (
    <Link href={href} className="logo-lockup">
      {mark && (
        <Image
          src={src}
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
