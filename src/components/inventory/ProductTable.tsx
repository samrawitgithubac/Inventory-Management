"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import { StockBadge } from "@/components/ui/StockBadge";
import { formatDate } from "@/lib/format";
import type { Item } from "@/types/item";
import type { StatusFilter } from "@/types/inventory";

type ProductTableProps = {
  items: Item[];
  filteredItems: Item[];
  totalCount: number;
  loading: boolean;
  search: string;
  statusFilter: StatusFilter;
  deletingId: number | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onAddFirst: () => void;
};

export default function ProductTable({
  filteredItems,
  totalCount,
  loading,
  search,
  statusFilter,
  deletingId,
  onSearchChange,
  onStatusFilterChange,
  onEdit,
  onDelete,
  onAddFirst,
}: ProductTableProps) {
  const isEmptyCatalog = totalCount === 0;

  return (
    <div className="card-surface overflow-hidden !shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Products
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {filteredItems.length} of {totalCount} shown
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="input-field !mt-0 w-full !min-h-10 !py-2 !pl-9 sm:w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
              className="input-field !mt-0 !min-h-10 !w-auto cursor-pointer !py-2"
            >
              <option value="all">All statuses</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 p-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="skeleton h-14 w-full" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title={isEmptyCatalog ? "No products yet" : "No matching products"}
            description={
              isEmptyCatalog
                ? "Start building your catalog by adding your first product with image, price, and quantity."
                : "Try adjusting your search or status filter to find what you need."
            }
            actionLabel={isEmptyCatalog ? "Add first product" : undefined}
            onAction={isEmptyCatalog ? onAddFirst : undefined}
          />
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)]/80 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  <th className="px-6 py-3">Product name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Date added</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-150 hover:bg-[var(--primary-soft)]/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--background)] ring-1 ring-[var(--border)]">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-[var(--muted)]">
                              N/A
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-[var(--foreground)]">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium tabular-nums">
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 tabular-nums">{item.quantity}</td>
                    <td className="px-4 py-4 text-[var(--muted)]">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <StockBadge quantity={item.quantity} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="mr-2 text-sm font-medium text-[var(--primary-hover)] underline-offset-2 hover:underline dark:text-[var(--primary)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => onDelete(item)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === item.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--border)] md:hidden">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-4 transition-colors hover:bg-[var(--primary-soft)]/20"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--background)] ring-1 ring-[var(--border)]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
                    <StockBadge quantity={item.quantity} />
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    ${Number(item.price).toFixed(2)} · Qty {item.quantity}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatDate(item.createdAt)}
                  </p>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="text-sm font-medium text-[var(--primary-hover)] dark:text-[var(--primary)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => onDelete(item)}
                      className="text-sm font-medium text-red-600 disabled:opacity-50"
                    >
                      {deletingId === item.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
