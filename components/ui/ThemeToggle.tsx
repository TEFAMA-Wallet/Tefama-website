"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={`theme-toggle ${className ?? ""}`}
    >
      <span className="knob">
        {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  );
}
