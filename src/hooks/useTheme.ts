"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getServerTheme(): Theme {
  return "light";
}

function getClientTheme(): Theme {
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getClientTheme,
    getServerTheme,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    emitChange();
  }, [theme]);

  return { theme, toggleTheme };
}
