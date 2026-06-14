import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export default function Button({
  variant = "secondary", size = "md", block, icon, onClick, children, type = "button", disabled, className = ""
}: ButtonProps) {
  const cls = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
    block ? "btn-block" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button className={cls} onClick={onClick} type={type} disabled={disabled}>
      {icon && icon}
      {children}
    </button>
  );
}
