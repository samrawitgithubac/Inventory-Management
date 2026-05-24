"use client";

import Image from "next/image";
import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import Toast, { type ToastType } from "@/components/Toast";
import type { Item } from "@/db/schema";

type FormState = {
  name: string;
  description: string;
  quantity: string;
  price: string;
};

type View = "dashboard" | "add-product";

const emptyForm: FormState = {
  name: "",
  description: "",
  quantity: "0",
  price: "0.00",
};

const inputClass =
  "mt-1.5 w-full min-h-[44px] rounded-lg border border-zinc-200 bg-zinc-50/80 px-3.5 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 transition focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:text-sm";

const btnPrimary =
  "min-h-[48px] flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-amber-900/10 hover:bg-[var(--primary-hover)] disabled:opacity-60";

type InventoryAppProps = {
  initialItems?: Item[];
  loadError?: string | null;
};

/** Quantity below this (but above 0) shows as "Low stock". */
const LOW_STOCK_THRESHOLD = 5;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getQuantityForStatus(value: string) {
  const qty = Number(value);
  return Number.isNaN(qty) || qty < 0 ? 0 : qty;
}

function StockStatus({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return (
      <span className="inline-flex rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Out of stock
      </span>
    );
  }
  if (quantity < LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex rounded-full border border-zinc-400 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
        Low stock
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white">
      In stock
    </span>
  );
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  const props = { className: className ?? "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 };
  switch (name) {
    case "dashboard":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      );
    case "products":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9-5.25m0 0-9-5.25M3 7.5l9 5.25M3 7.5v9l9 5.25 9-5.25V7.5" />
        </svg>
      );
    case "add":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    default:
      return null;
  }
}

export default function InventoryApp({
  initialItems = [],
  loadError = null,
}: InventoryAppProps) {
  const imageInputId = useId();
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in" | "low" | "out">("all");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [loading, setLoading] = useState(!initialItems.length && !loadError);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(loadError);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const totalValue = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const lowStockCount = items.filter(
    (i) => i.quantity > 0 && i.quantity < LOW_STOCK_THRESHOLD,
  ).length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "out" && item.quantity === 0) ||
        (statusFilter === "low" &&
          item.quantity > 0 &&
          item.quantity < LOW_STOCK_THRESHOLD) ||
        (statusFilter === "in" && item.quantity >= LOW_STOCK_THRESHOLD);
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const fetchItems = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch("/api/items", { signal: controller.signal });
      if (!res.ok) throw new Error("Failed to load");
      setItems(await res.json());
      setError(null);
    } catch (err) {
      if (!loadError) {
        setError(
          err instanceof Error && err.name === "AbortError"
            ? "Connection timed out."
            : "Could not load products.",
        );
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [loadError]);

  useEffect(() => {
    if (initialItems.length > 0 || loadError) {
      setLoading(false);
      return;
    }
    fetchItems();
  }, [fetchItems, initialItems.length, loadError]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!success) return;
    showToast(success, "success");
    setSuccess(null);
  }, [success, showToast]);

  function goTo(viewName: View) {
    setView(viewName);
    setSidebarOpen(false);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setError(null);
  }

  function handleEdit(item: Item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      quantity: String(item.quantity),
      price: item.price,
    });
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(item.imageUrl);
    setError(null);
    setSuccess(null);
    setView("add-product");
    setSidebarOpen(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  async function uploadProductImage() {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("file", imageFile);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return { url: data.url, publicId: data.publicId };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      let imageUrl: string | null = imagePreview;
      let imagePublicId: string | null = null;
      if (imageFile) {
        const uploaded = await uploadProductImage();
        if (uploaded) {
          imageUrl = uploaded.url;
          imagePublicId = uploaded.publicId;
        }
      } else if (editingId) {
        imagePublicId = items.find((i) => i.id === editingId)?.imagePublicId ?? null;
      }
      const res = await fetch(editingId ? `/api/items/${editingId}` : "/api/items", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          quantity: form.quantity,
          price: form.price,
          imageUrl,
          imagePublicId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      await fetchItems();
      resetForm();
      setView("dashboard");
      setSuccess(editingId ? "Product updated." : "Product added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function requestDelete(item: Item) {
    if (deletingId !== null) return;
    setDeleteTarget(item);
  }

  function cancelDelete() {
    if (deletingId !== null) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget || deletingId !== null) return;

    const id = deleteTarget.id;
    setDeletingId(id);
    setError(null);

    const previousItems = items;

    try {
      setItems((current) => current.filter((item) => item.id !== id));

      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (res.ok || res.status === 404) {
        setDeleteTarget(null);
        if (editingId === id) resetForm();
        showToast("Product deleted successfully.", "success");
        void fetchItems();
        return;
      }

      setItems(previousItems);
      throw new Error(data.error ?? "Failed to delete product");
    } catch (err) {
      setItems(previousItems);
      showToast(
        err instanceof Error ? err.message : "Delete failed",
        "error",
      );
      void fetchItems();
    } finally {
      setDeletingId(null);
    }
  }

  function exportCsv() {
    const header = "Name,Price,Quantity,Status,Date Added\n";
    const rows = items
      .map(
        (i) =>
          `"${i.name}",${i.price},${i.quantity},${i.quantity >= LOW_STOCK_THRESHOLD ? "In stock" : i.quantity === 0 ? "Out" : "Low"},${formatDate(i.createdAt)}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const formattedTotal = totalValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "add-product", label: "Add Product", icon: "add" },
  ];

  const sidebar = (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:z-auto lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-5 dark:border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-white shadow-md shadow-amber-900/20">
          <span className="text-lg font-bold">I</span>
        </div>
        <span className="text-lg font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
          Inventory
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Menu
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = view === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.id === "add-product") resetForm();
                    goTo(item.id);
                  }}
                  className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--primary-soft)] text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[var(--primary)]" />
                  )}
                  <span className={active ? "text-[var(--primary-hover)] dark:text-[var(--primary)]" : "text-zinc-400"}>
                    <NavIcon name={item.icon} />
                  </span>
                  {item.label}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => goTo("dashboard")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <span className="text-zinc-400">
                <NavIcon name="products" />
              </span>
              Products
              <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {items.length}
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );

  const productForm = (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="mb-6 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {editingId ? "Edit product" : "Add new product"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {editingId ? "Update product details below." : "Fill in the form to add to inventory."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-zinc-700">
            Product name *
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="e.g. Inhaler X12"
          />
        </div>
        <div>
          <label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} resize-none`}
            placeholder="Optional"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
          <div>
            <label htmlFor="quantity" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className={inputClass}
            />
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Status is chosen automatically from quantity:
              <span className="mt-1 block">
                0 → Out of stock · 1–{LOW_STOCK_THRESHOLD - 1} → Low stock ·{" "}
                {LOW_STOCK_THRESHOLD}+ → In stock
              </span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Status preview:
              </span>
              <StockStatus quantity={getQuantityForStatus(form.quantity)} />
            </div>
          </div>
          <div>
            <label htmlFor="price" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`${inputClass} pl-7`}
              />
            </div>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Product image</span>
          <input
            id={imageInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="sr-only"
          />
          {imagePreview ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="relative aspect-video max-h-48 w-full bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain p-2"
                  unoptimized={imagePreview.startsWith("blob:")}
                />
              </div>
              <div className="flex border-t border-zinc-200 dark:border-zinc-700">
                <label
                  htmlFor={imageInputId}
                  className="flex-1 cursor-pointer py-2.5 text-center text-sm font-medium text-[var(--primary-hover)] hover:bg-[var(--primary-soft)] dark:text-[var(--primary)] dark:hover:bg-amber-950/30"
                >
                  Replace
                </label>
                <button
                  type="button"
                  onClick={clearImage}
                  className="flex-1 border-l border-zinc-200 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor={imageInputId}
              className="mt-2 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-zinc-200 py-8 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] dark:border-zinc-700 dark:hover:bg-amber-950/20"
            >
              <span className="text-sm font-medium text-zinc-600">Upload image</span>
              <span className="mt-1 text-xs text-zinc-400">PNG, JPG up to 5MB</span>
            </label>
          )}
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? "Saving…" : editingId ? "Save changes" : "Add product"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              goTo("dashboard");
            }}
            className="min-h-[48px] rounded-lg border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 lg:hidden"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <p className="truncate text-sm font-medium text-zinc-600 sm:text-base dark:text-zinc-400">
              Welcome to{" "}
              <span className="font-semibold text-[var(--primary-hover)] dark:text-[var(--primary)]">
                Inventory Management
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="shrink-0 rounded-lg border border-zinc-200 p-2.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {view === "add-product" ? (
            <div>
              <p className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">
                Inventory / <span className="text-zinc-800 dark:text-zinc-200">{editingId ? "Edit" : "Add Product"}</span>
              </p>
              <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {editingId ? "Edit product" : "Add product"}
              </h1>
              {productForm}
            </div>
          ) : (
            <>
              {/* Page header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Inventory / <span className="text-zinc-800 dark:text-zinc-200">Dashboard</span>
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">Dashboard</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    defaultValue="all"
                    aria-label="Filter date"
                  >
                    <option value="all">All time</option>
                    <option value="month">This month</option>
                  </select>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3.75" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              {error && view === "dashboard" && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Stats */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Inventory value</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--primary-hover)] dark:text-[var(--primary)]">${formattedTotal}</p>
                  <p className="mt-2 text-xs text-zinc-400">Last update: just now</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Total products</p>
                  <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{items.length}</p>
                  <p className="mt-2 text-xs text-zinc-400">Active on the platform</p>
                </div>
                <div className="flex flex-col justify-between rounded-2xl border border-[#b8941f] bg-gradient-to-br from-[#d4af37] to-[#b8941f] p-5 text-white shadow-md shadow-amber-900/15 sm:col-span-2 lg:col-span-1">
                  <div>
                    <p className="text-lg font-semibold leading-snug">
                      Manage inventory on the go!
                    </p>
                    <p className="mt-2 text-sm text-amber-50/90">Add and track products anytime.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      goTo("add-product");
                    }}
                    className="mt-4 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-50 sm:w-auto sm:px-6"
                  >
                    Add new product
                  </button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Add Product", desc: "Add and manage inventory", action: () => { resetForm(); goTo("add-product"); } },
                  { title: "Products", desc: `${items.length} items in catalog`, action: () => goTo("dashboard") },
                  { title: "Low stock", desc: `${lowStockCount} need attention`, action: () => setStatusFilter("low") },
                  { title: "Export data", desc: "Download CSV report", action: exportCsv },
                ].map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={card.action}
                    className="group flex items-start justify-between rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-[var(--primary)] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[var(--primary)]"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">{card.title}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{card.desc}</p>
                    </div>
                    <span className="rounded-full bg-[var(--primary-soft)] p-1.5 text-[var(--primary-hover)] transition group-hover:bg-[var(--primary)] group-hover:text-white dark:bg-amber-950/40 dark:text-[var(--primary)]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>

              {/* Products table */}
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New products</h2>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                          type="search"
                          placeholder="Search products…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 sm:w-56"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                      >
                        <option value="all">Filter by status</option>
                        <option value="in">In stock</option>
                        <option value="low">Low stock</option>
                        <option value="out">Out of stock</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3 p-6">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="px-6 py-16 text-center text-sm text-zinc-500">
                    {items.length === 0
                      ? "No products yet. Add your first product."
                      : "No products match your search."}
                    {items.length === 0 && (
                      <button
                        type="button"
                        onClick={() => { resetForm(); goTo("add-product"); }}
                        className="mt-4 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
                      >
                        Add product
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                            <th className="px-6 py-3">Product name</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Quantity</th>
                            <th className="px-4 py-3">Date added</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                                    {item.imageUrl ? (
                                      <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                                        N/A
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-medium">${Number(item.price).toFixed(2)}</td>
                              <td className="px-4 py-4">{item.quantity}</td>
                              <td className="px-4 py-4 text-zinc-600">{formatDate(item.createdAt)}</td>
                              <td className="px-4 py-4">
                                <StockStatus quantity={item.quantity} />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item);
                                  }}
                                  className="mr-2 text-sm font-medium text-[var(--primary-hover)] underline-offset-2 hover:underline dark:text-[var(--primary)]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingId === item.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    requestDelete(item);
                                  }}
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

                    {/* Mobile list */}
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 md:hidden">
                      {filteredItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="56px" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-zinc-400">—</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</p>
                              <StockStatus quantity={item.quantity} />
                            </div>
                            <p className="mt-1 text-sm text-zinc-600">
                              ${Number(item.price).toFixed(2)} · Qty {item.quantity}
                            </p>
                            <p className="text-xs text-zinc-400">{formatDate(item.createdAt)}</p>
                            <div className="mt-2 flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                className="text-sm font-medium text-[var(--primary-hover)] dark:text-[var(--primary)]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDelete(item);
                                }}
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
            </>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-zinc-200 bg-white pb-safe dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "add-product") resetForm();
                goTo(item.id);
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold ${
                view === item.id ? "text-[var(--primary-hover)] dark:text-[var(--primary)]" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <NavIcon name={item.icon} className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-zinc-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            Menu
          </button>
        </nav>
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        productName={deleteTarget?.name ?? "this product"}
        loading={deletingId !== null}
        onCancel={cancelDelete}
        onConfirm={() => void confirmDelete()}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
