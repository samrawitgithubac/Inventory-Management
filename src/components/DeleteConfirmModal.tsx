"use client";

import { Trash2 } from "lucide-react";

type DeleteConfirmModalProps = {
  open: boolean;
  productName: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({
  open,
  productName,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-label="Close dialog"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative w-full max-w-md animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-lg)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200/80 dark:bg-red-950/50 dark:ring-red-900/50">
          <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={1.75} />
        </div>

        <h2
          id="delete-dialog-title"
          className="mt-4 text-center text-lg font-semibold tracking-tight text-[var(--foreground)]"
        >
          Delete product?
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-[var(--muted)]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[var(--foreground)]">{productName}</span>? This
          action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="btn-secondary flex-1 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="min-h-[2.75rem] flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-60 sm:flex-none"
          >
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
