"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

/**
 * Light/dark switch. The initial theme is set pre-paint by the inline script in
 * the root layout; this component just reflects and mutates it, persisting the
 * explicit choice to localStorage.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || "light";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = (document.documentElement.dataset.theme as Theme) === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("w2w-theme", next);
    } catch {
      /* storage unavailable — session-only toggle */
    }
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme"
      suppressHydrationWarning
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <Sun className="theme-ico theme-ico-sun" size={15} strokeWidth={1.75} />
        <Moon className="theme-ico theme-ico-moon" size={15} strokeWidth={1.75} />
      </span>
    </button>
  );
}
