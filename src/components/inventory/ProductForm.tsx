"use client";

import Image from "next/image";
import { Upload, X } from "lucide-react";
import { FormEvent } from "react";
import { StockBadge } from "@/components/ui/StockBadge";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";
import { getQuantityForStatus } from "@/lib/inventory-utils";
import type { ProductFormState } from "@/types/inventory";

type ProductFormProps = {
  form: ProductFormState;
  editingId: number | null;
  error: string | null;
  submitting: boolean;
  imageInputId: string;
  imagePreview: string | null;
  onChange: (form: ProductFormState) => void;
  onSubmit: (e: FormEvent) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onCancel: () => void;
};

export default function ProductForm({
  form,
  editingId,
  error,
  submitting,
  imageInputId,
  imagePreview,
  onChange,
  onSubmit,
  onImageChange,
  onClearImage,
  onCancel,
}: ProductFormProps) {
  return (
    <div className="card-surface animate-fade-up p-4 sm:p-6">
      <div className="mb-6 border-b border-[var(--border)] pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {editingId ? "Edit product" : "Add new product"}
        </h2>
        <p className="page-subtitle !mt-1">
          {editingId
            ? "Update product details below."
            : "Fill in the form to add to inventory."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="max-w-xl space-y-5">
        <div>
          <label htmlFor="name" className="label-text">
            Product name *
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="e.g. Inhaler X12"
          />
        </div>
        <div>
          <label htmlFor="description" className="label-text">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="input-field resize-none"
            placeholder="Optional"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
          <div>
            <label htmlFor="quantity" className="label-text">
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              required
              value={form.quantity}
              onChange={(e) => onChange({ ...form, quantity: e.target.value })}
              className="input-field"
            />
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              Status is chosen automatically from quantity:
              <span className="mt-1 block">
                0 → Out of stock · 1–{LOW_STOCK_THRESHOLD - 1} → Low stock ·{" "}
                {LOW_STOCK_THRESHOLD}+ → In stock
              </span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--muted)]">
                Status preview:
              </span>
              <StockBadge quantity={getQuantityForStatus(form.quantity)} />
            </div>
          </div>
          <div>
            <label htmlFor="price" className="label-text">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                $
              </span>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => onChange({ ...form, price: e.target.value })}
                className="input-field !pl-7"
              />
            </div>
          </div>
        </div>
        <div>
          <span className="label-text">Product image</span>
          <input
            id={imageInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onImageChange}
            className="sr-only"
          />
          {imagePreview ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)]">
              <div className="relative aspect-video max-h-48 w-full bg-[var(--background)]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain p-2"
                  unoptimized={imagePreview.startsWith("blob:")}
                />
              </div>
              <div className="flex border-t border-[var(--border)]">
                <label
                  htmlFor={imageInputId}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 py-2.5 text-sm font-medium text-[var(--primary-hover)] transition hover:bg-[var(--primary-soft)] dark:text-[var(--primary)]"
                >
                  <Upload className="h-4 w-4" />
                  Replace
                </label>
                <button
                  type="button"
                  onClick={onClearImage}
                  className="flex flex-1 items-center justify-center gap-2 border-l border-[var(--border)] py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--primary-soft)]/50"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor={imageInputId}
              className="mt-2 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-[var(--border)] py-10 transition-all duration-200 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
            >
              <Upload className="mb-2 h-8 w-8 text-[var(--primary)]" strokeWidth={1.5} />
              <span className="text-sm font-medium text-[var(--foreground)]">
                Upload image
              </span>
              <span className="mt-1 text-xs text-[var(--muted)]">PNG, JPG up to 5MB</span>
            </label>
          )}
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Saving…" : editingId ? "Save changes" : "Add product"}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
