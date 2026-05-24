import { cn } from "@/lib/cn";

const LOW_STOCK_THRESHOLD = 5;

export function getStockKind(quantity: number) {
  if (quantity === 0) return "out" as const;
  if (quantity < LOW_STOCK_THRESHOLD) return "low" as const;
  return "in" as const;
}

export function StockBadge({
  quantity,
  className,
}: {
  quantity: number;
  className?: string;
}) {
  const kind = getStockKind(quantity);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        kind === "in" &&
          "bg-[var(--primary-soft)] text-[var(--primary-hover)] ring-1 ring-[var(--primary-muted)] dark:text-[var(--primary)]",
        kind === "low" &&
          "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800",
        kind === "out" &&
          "bg-stone-100 text-stone-600 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:ring-stone-700",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          kind === "in" && "bg-[var(--primary)]",
          kind === "low" && "bg-amber-500",
          kind === "out" && "bg-stone-400",
        )}
      />
      {kind === "in" ? "In stock" : kind === "low" ? "Low stock" : "Out of stock"}
    </span>
  );
}

export { LOW_STOCK_THRESHOLD };
