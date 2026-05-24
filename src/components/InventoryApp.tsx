"use client";

import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  LayoutDashboard,
  Menu,
  Moon,
  Package,
  Plus,
  Search,
  Sparkles,
  Sun,
  PackageX,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import StatCard from "@/components/dashboard/StatCard";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import Toast, { type ToastType } from "@/components/Toast";
import { LOW_STOCK_THRESHOLD, StockBadge } from "@/components/ui/StockBadge";
import type { Item } from "@/db/schema";
import { cn } from "@/lib/cn";

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

type InventoryAppProps = {
  initialItems?: Item[];
  loadError?: string | null;
};

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
  const outOfStockCount = items.filter((i) => i.quantity === 0).length;

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

  const navItems: {
    id: View;
    label: string;
    icon: typeof LayoutDashboard;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add-product", label: "Add Product", icon: Plus },
  ];

  const sidebar = (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-lg transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
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
          {navItems.map((item) => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.id === "add-product") resetForm();
                    goTo(item.id);
                  }}
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
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => goTo("dashboard")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-all duration-200 hover:bg-[var(--primary-soft)]/60 hover:text-[var(--foreground)]"
            >
              <Package className="h-5 w-5 shrink-0 opacity-70" strokeWidth={1.75} />
              Products
              <span className="ml-auto rounded-full bg-[var(--primary-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary-hover)] ring-1 ring-[var(--primary-muted)] dark:text-[var(--primary)]">
                {items.length}
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );

  const productForm = (
    <div className="card-surface animate-fade-up p-4 sm:p-6">
      <div className="mb-6 border-b border-[var(--border)] pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {editingId ? "Edit product" : "Add new product"}
        </h2>
        <p className="page-subtitle !mt-1">
          {editingId ? "Update product details below." : "Fill in the form to add to inventory."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div>
          <label htmlFor="name" className="label-text">
            Product name *
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
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
              <span className="text-xs font-medium text-[var(--muted)]">Status preview:</span>
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
                onChange={(e) => setForm({ ...form, price: e.target.value })}
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
            onChange={handleImageChange}
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
                  onClick={clearImage}
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
              <span className="text-sm font-medium text-[var(--foreground)]">Upload image</span>
              <span className="mt-1 text-xs text-[var(--muted)]">PNG, JPG up to 5MB</span>
            </label>
          )}
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Saving…" : editingId ? "Save changes" : "Add product"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              goTo("dashboard");
            }}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const quickActions = [
    {
      title: "Add Product",
      desc: "Add and manage inventory",
      icon: Plus,
      action: () => {
        resetForm();
        goTo("add-product");
      },
    },
    {
      title: "Products",
      desc: `${items.length} items in catalog`,
      icon: Package,
      action: () => goTo("dashboard"),
    },
    {
      title: "Low stock",
      desc: `${lowStockCount} need attention`,
      icon: AlertTriangle,
      action: () => setStatusFilter("low"),
    },
    {
      title: "Export data",
      desc: "Download CSV report",
      icon: Download,
      action: exportCsv,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
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
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--card)]/90 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="btn-secondary !min-h-0 shrink-0 !p-2.5 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="truncate text-sm font-medium text-[var(--muted)] sm:text-base">
              Welcome to{" "}
              <span className="font-semibold text-[var(--primary-hover)] dark:text-[var(--primary)]">
                Inventory Management
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn-secondary !min-h-0 shrink-0 !p-2.5"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {view === "add-product" ? (
            <div className="animate-fade-up">
              <p className="text-sm text-[var(--muted)]">
                Inventory /{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {editingId ? "Edit" : "Add Product"}
                </span>
              </p>
              <h1 className="page-title mb-6 mt-1">
                {editingId ? "Edit product" : "Add product"}
              </h1>
              {productForm}
            </div>
          ) : loading && items.length === 0 ? (
            <DashboardSkeleton />
          ) : (
            <div className="animate-fade-up">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)]">
                    Inventory /{" "}
                    <span className="font-medium text-[var(--foreground)]">Dashboard</span>
                  </p>
                  <h1 className="page-title mt-1">Dashboard</h1>
                  <p className="page-subtitle">
                    Overview of inventory value, stock health, and products.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={exportCsv} className="btn-primary !min-h-10">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Inventory value"
                  value={`$${formattedTotal}`}
                  hint="Price × quantity across catalog"
                  icon={Wallet}
                  variant="gold"
                  trend={items.length > 0 ? "Live total" : undefined}
                />
                <StatCard
                  label="Total products"
                  value={String(items.length)}
                  hint="Active in your catalog"
                  icon={Package}
                />
                <StatCard
                  label="Low stock"
                  value={String(lowStockCount)}
                  hint={`Qty 1–${LOW_STOCK_THRESHOLD - 1} needs reorder`}
                  icon={AlertTriangle}
                />
                <StatCard
                  label="Out of stock"
                  value={String(outOfStockCount)}
                  hint="Zero quantity items"
                  icon={PackageX}
                  variant="dark"
                />
              </div>

              <div className="card-surface mb-6 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                      Manage inventory on the go
                    </p>
                    <p className="page-subtitle !mt-1">
                      Add products, track stock levels, and export reports in one place.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    goTo("add-product");
                  }}
                  className="btn-primary shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add new product
                </button>
              </div>

              <DashboardCharts items={items} />

              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={card.action}
                      className="card-surface group flex items-start justify-between p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{card.title}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{card.desc}</p>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-[var(--primary-soft)] p-2 text-[var(--primary-hover)] transition-all duration-200 group-hover:bg-[var(--primary)] group-hover:text-white dark:text-[var(--primary)]">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="card-surface overflow-hidden !shadow-[var(--shadow-sm)]">
                <div className="border-b border-[var(--border)] px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                        Products
                      </h2>
                      <p className="text-sm text-[var(--muted)]">
                        {filteredItems.length} of {items.length} shown
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                        <input
                          type="search"
                          placeholder="Search products…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="input-field !mt-0 w-full !min-h-10 !py-2 !pl-9 sm:w-56"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(e.target.value as typeof statusFilter)
                        }
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
                      title={
                        items.length === 0
                          ? "No products yet"
                          : "No matching products"
                      }
                      description={
                        items.length === 0
                          ? "Start building your catalog by adding your first product with image, price, and quantity."
                          : "Try adjusting your search or status filter to find what you need."
                      }
                      actionLabel={items.length === 0 ? "Add first product" : undefined}
                      onAction={
                        items.length === 0
                          ? () => {
                              resetForm();
                              goTo("add-product");
                            }
                          : undefined
                      }
                    />
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
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
                                      <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-[10px] text-[var(--muted)]">
                                        N/A
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-medium text-[var(--foreground)]">{item.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-medium tabular-nums">
                                ${Number(item.price).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 tabular-nums">{item.quantity}</td>
                              <td className="px-4 py-4 text-[var(--muted)]">{formatDate(item.createdAt)}</td>
                              <td className="px-4 py-4">
                                <StockBadge quantity={item.quantity} />
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
                    <div className="divide-y divide-[var(--border)] md:hidden">
                      {filteredItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-4 transition-colors hover:bg-[var(--primary-soft)]/20">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--background)] ring-1 ring-[var(--border)]">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="56px" />
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
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-[var(--border)] bg-[var(--card)]/95 pb-safe backdrop-blur-md lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "add-product") resetForm();
                  goTo(item.id);
                }}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                  active
                    ? "text-[var(--primary-hover)] dark:text-[var(--primary)]"
                    : "text-[var(--muted)]",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label.split(" ")[0]}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-[var(--muted)]"
          >
            <Menu className="h-5 w-5" />
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
