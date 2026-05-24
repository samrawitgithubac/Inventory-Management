"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { isDashboardPath, isProductsNewPath, routes } from "@/lib/routes";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: routes.dashboard,
    label: "Dashboard",
    icon: LayoutDashboard,
    isActive: isDashboardPath,
  },
  {
    href: routes.productsNew,
    label: "Add Product",
    icon: Plus,
    isActive: isProductsNewPath,
  },
];

type InventorySidebarProps = {
  open: boolean;
  productCount: number;
  onClose: () => void;
};

export default function InventorySidebar({
  open,
  productCount,
  onClose,
}: InventorySidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-lg transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md ring-1 ring-[var(--primary-muted)]">
          <Package className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div>
          <span className="block text-lg font-bold leading-tight tracking-tight text-[var(--foreground)]">
            Inventory
          </span>
          <span className="text-xs font-medium text-[var(--muted)]">Management</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Menu
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-[var(--primary-soft)] text-[var(--primary-hover)] shadow-sm dark:text-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-[var(--primary-soft)]/60 hover:text-[var(--foreground)]",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[var(--primary)]" />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active ? "text-[var(--primary)]" : "opacity-70",
                    )}
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href={routes.dashboard}
              onClick={onClose}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isDashboardPath(pathname)
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:bg-[var(--primary-soft)]/60 hover:text-[var(--foreground)]",
              )}
            >
              <Package className="h-5 w-5 shrink-0 opacity-70" strokeWidth={1.75} />
              Products
              <span className="ml-auto rounded-full bg-[var(--primary-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary-hover)] ring-1 ring-[var(--primary-muted)] dark:text-[var(--primary)]">
                {productCount}
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export { NAV_ITEMS };
