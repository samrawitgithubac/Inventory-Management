"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardView from "@/components/inventory/DashboardView";
import { useInventory } from "@/components/inventory/InventoryProvider";
import { routes } from "@/lib/routes";
import {
  computeInventoryValue,
  exportItemsCsv,
  filterItems,
} from "@/lib/inventory-utils";
import { countLowStock, countOutOfStock } from "@/lib/stock";
import type { Item } from "@/types/item";
import type { StatusFilter } from "@/types/inventory";

type DashboardPageClientProps = {
  initialStatus?: StatusFilter;
};

export default function DashboardPageClient({
  initialStatus = "all",
}: DashboardPageClientProps) {
  const router = useRouter();
  const {
    items,
    loading,
    error,
    search,
    statusFilter,
    deletingId,
    setSearch,
    setStatusFilter,
    requestDelete,
  } = useInventory();

  useEffect(() => {
    if (initialStatus !== "all") {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus, setStatusFilter]);

  const filteredItems = filterItems(items, search, statusFilter);
  const inventoryValue = computeInventoryValue(items);
  const lowStockCount = countLowStock(items);
  const outOfStockCount = countOutOfStock(items);

  if (loading && items.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardView
      items={items}
      filteredItems={filteredItems}
      loading={loading}
      error={error}
      search={search}
      statusFilter={statusFilter}
      deletingId={deletingId}
      inventoryValue={inventoryValue}
      lowStockCount={lowStockCount}
      outOfStockCount={outOfStockCount}
      onSearchChange={setSearch}
      onStatusFilterChange={setStatusFilter}
      onEdit={(item: Item) => router.push(routes.productEdit(item.id))}
      onDelete={requestDelete}
      onExport={() => exportItemsCsv(items)}
      onAddProduct={() => router.push(routes.productsNew)}
      onAddFirst={() => router.push(routes.productsNew)}
      onQuickAction={(action) => {
        switch (action) {
          case "add":
            router.push(routes.productsNew);
            break;
          case "products":
            router.push(routes.dashboard);
            break;
          case "low":
            router.push(`${routes.dashboard}?status=low`);
            break;
          case "export":
            exportItemsCsv(items);
            break;
        }
      }}
    />
  );
}
