"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "tefama-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  /* start dark (matches FOUC script default) */
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    /* sync with the value the FOUC script already applied */
    const applied = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (applied === "light" || applied === "dark") setTheme(applied);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
