"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";

export type ToastType = "success" | "error";

type ToastProps = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose, message]);

  const isSuccess = type === "success";

  return (
    <div
      className="fixed bottom-24 left-1/2 z-[110] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-fade-up lg:bottom-8"
      role="status"
    >
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[var(--shadow-lg)] backdrop-blur-sm",
          isSuccess
            ? "border-emerald-200/80 bg-[var(--card)] dark:border-emerald-900/50"
            : "border-red-200/80 bg-[var(--card)] dark:border-red-900/50",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            isSuccess
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
          )}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
          ) : (
            <XCircle className="h-4 w-4" strokeWidth={2.25} />
          )}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {isSuccess ? "Success" : "Error"}
          </p>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary !min-h-0 shrink-0 !p-1.5"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
