"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { ToastType } from "@/components/Toast";
import { routes } from "@/lib/routes";
import type { Item } from "@/types/item";
import type { StatusFilter } from "@/types/inventory";

type InventoryContextValue = {
  items: Item[];
  loading: boolean;
  error: string | null;
  search: string;
  statusFilter: StatusFilter;
  deletingId: number | null;
  deleteTarget: Item | null;
  toast: { message: string; type: ToastType } | null;
  setSearch: (value: string) => void;
  setStatusFilter: (value: StatusFilter) => void;
  fetchItems: () => Promise<void>;
  requestDelete: (item: Item) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
  showToast: (message: string, type: ToastType) => void;
  dismissToast: () => void;
  refreshAfterMutation: () => Promise<void>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return ctx;
}

type InventoryProviderProps = {
  initialItems: Item[];
  loadError?: string | null;
  children: ReactNode;
};

export function InventoryProvider({
  initialItems,
  loadError = null,
  children,
}: InventoryProviderProps) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [loading, setLoading] = useState(!initialItems.length && !loadError);
  const [error, setError] = useState<string | null>(loadError);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (initialItems.length > 0 || loadError) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    void (async () => {
      try {
        const res = await fetch("/api/items", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load");
        if (cancelled) return;
        setItems(await res.json());
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error && err.name === "AbortError"
            ? "Connection timed out."
            : "Could not load products.",
        );
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [initialItems.length, loadError]);

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

  const refreshAfterMutation = useCallback(async () => {
    await fetchItems();
    router.refresh();
  }, [fetchItems, router]);

  const requestDelete = useCallback(
    (item: Item) => {
      if (deletingId !== null) return;
      setDeleteTarget(item);
    },
    [deletingId],
  );

  const cancelDelete = useCallback(() => {
    if (deletingId !== null) return;
    setDeleteTarget(null);
  }, [deletingId]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || deletingId !== null) return;

    const id = deleteTarget.id;
    setDeletingId(id);
    const previousItems = items;

    try {
      setItems((current) => current.filter((item) => item.id !== id));

      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.ok || res.status === 404) {
        setDeleteTarget(null);
        showToast("Product deleted successfully.", "success");
        router.refresh();
        return;
      }

      setItems(previousItems);
      throw new Error(data.error ?? "Failed to delete product");
    } catch (err) {
      setItems(previousItems);
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
      await fetchItems();
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, deletingId, items, fetchItems, showToast, router]);

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      search,
      statusFilter,
      deletingId,
      deleteTarget,
      toast,
      setSearch,
      setStatusFilter,
      fetchItems,
      requestDelete,
      cancelDelete,
      confirmDelete,
      showToast,
      dismissToast,
      refreshAfterMutation,
    }),
    [
      items,
      loading,
      error,
      search,
      statusFilter,
      deletingId,
      deleteTarget,
      toast,
      fetchItems,
      requestDelete,
      cancelDelete,
      confirmDelete,
      showToast,
      dismissToast,
      refreshAfterMutation,
    ],
  );

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
  );
}

export { routes };
