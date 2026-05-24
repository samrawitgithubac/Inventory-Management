import { PackageOpen, Plus } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] ring-1 ring-[var(--primary-muted)]">
        <PackageOpen className="h-8 w-8" strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary mt-6">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
