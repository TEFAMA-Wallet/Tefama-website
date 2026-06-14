import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "raised" | "elevated";
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function Card({ children, variant = "default", glow, className = "", style, onClick }: CardProps) {
  const cls = [
    "card",
    variant !== "default" ? variant : "",
    glow ? "glow" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={cls} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
