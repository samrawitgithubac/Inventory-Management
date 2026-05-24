"use client";

import { Menu, Moon, Sun } from "lucide-react";
import type { Theme } from "@/hooks/useTheme";

type InventoryHeaderProps = {
  theme: Theme;
  onOpenSidebar: () => void;
  onToggleTheme: () => void;
};

export default function InventoryHeader({
  theme,
  onOpenSidebar,
  onToggleTheme,
}: InventoryHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--card)]/90 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="btn-secondary !min-h-0 shrink-0 !p-2.5 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="truncate text-sm font-medium text-[var(--muted)] sm:text-base">
          Welcome to{" "}
          <span className="font-semibold text-[var(--primary-hover)] dark:text-[var(--primary)]">
            Inventory Management
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleTheme}
        className="btn-secondary !min-h-0 shrink-0 !p-2.5"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
