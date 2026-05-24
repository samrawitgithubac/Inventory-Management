import { Package } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md ring-1 ring-[var(--primary-muted)]">
          <Package className="h-6 w-6" strokeWidth={2.25} />
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
        <p className="text-sm font-medium text-[var(--muted)]">Loading…</p>
      </div>
    </div>
  );
}
