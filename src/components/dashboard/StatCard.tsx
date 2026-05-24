import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "gold" | "dark";
  className?: string;
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "card-surface group relative overflow-hidden p-5 sm:p-6",
        variant === "gold" &&
          "border-[var(--primary-muted)] bg-gradient-to-br from-[var(--primary-soft)] via-[var(--card)] to-[var(--card)]",
        variant === "dark" &&
          "border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 text-white",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-60",
          variant === "dark" ? "bg-[var(--primary)]" : "bg-[var(--primary-muted)]",
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.14em]",
              variant === "dark" ? "text-stone-400" : "text-[var(--muted)]",
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "mt-2 truncate text-3xl font-bold tracking-tight sm:text-[2rem]",
              variant === "dark" ? "text-white" : "text-[var(--foreground)]",
            )}
          >
            {value}
          </p>
          {hint && (
            <p
              className={cn(
                "mt-2 text-sm",
                variant === "dark" ? "text-stone-400" : "text-[var(--muted)]",
              )}
            >
              {hint}
            </p>
          )}
          {trend && (
            <p className="mt-2 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105",
            variant === "dark"
              ? "bg-white/10 text-[var(--primary)] ring-1 ring-white/10"
              : "bg-[var(--primary-soft)] text-[var(--primary-hover)] ring-1 ring-[var(--primary-muted)]",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
