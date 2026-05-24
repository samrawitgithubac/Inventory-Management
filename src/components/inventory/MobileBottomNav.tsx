"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./InventorySidebar";

type MobileBottomNavProps = {
  onOpenMenu: () => void;
};

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-[var(--border)] bg-[var(--card)]/95 pb-safe backdrop-blur-md lg:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.isActive(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
              active
                ? "text-[var(--primary-hover)] dark:text-[var(--primary)]"
                : "text-[var(--muted)]",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
            {item.label.split(" ")[0]}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-[var(--muted)]"
      >
        <Menu className="h-5 w-5" />
        Menu
      </button>
    </nav>
  );
}
