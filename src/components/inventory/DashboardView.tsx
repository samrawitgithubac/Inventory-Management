"use client";

import {
  AlertTriangle,
  ArrowRight,
  Download,
  Package,
  PackageX,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import StatCard from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/format";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";
import type { Item } from "@/types/item";
import ProductTable from "./ProductTable";
import type { StatusFilter } from "@/types/inventory";

type QuickAction = {
  title: string;
  desc: string;
  icon: LucideIcon;
  action: () => void;
};

type DashboardViewProps = {
  items: Item[];
  filteredItems: Item[];
  loading: boolean;
  error: string | null;
  search: string;
  statusFilter: StatusFilter;
  deletingId: number | null;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onExport: () => void;
  onAddProduct: () => void;
  onAddFirst: () => void;
  onQuickAction: (action: "add" | "products" | "low" | "export") => void;
};

export default function DashboardView({
  items,
  filteredItems,
  loading,
  error,
  search,
  statusFilter,
  deletingId,
  inventoryValue,
  lowStockCount,
  outOfStockCount,
  onSearchChange,
  onStatusFilterChange,
  onEdit,
  onDelete,
  onExport,
  onAddProduct,
  onAddFirst,
  onQuickAction,
}: DashboardViewProps) {
  const quickActions: QuickAction[] = [
    {
      title: "Add Product",
      desc: "Add and manage inventory",
      icon: Plus,
      action: () => onQuickAction("add"),
    },
    {
      title: "Products",
      desc: `${items.length} items in catalog`,
      icon: Package,
      action: () => onQuickAction("products"),
    },
    {
      title: "Low stock",
      desc: `${lowStockCount} need attention`,
      icon: AlertTriangle,
      action: () => onQuickAction("low"),
    },
    {
      title: "Export data",
      desc: "Download CSV report",
      icon: Download,
      action: () => onQuickAction("export"),
    },
  ];

  return (
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
          <button type="button" onClick={onExport} className="btn-primary !min-h-10">
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
          value={`$${formatCurrency(inventoryValue)}`}
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
        <button type="button" onClick={onAddProduct} className="btn-primary shrink-0">
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

      <ProductTable
        items={items}
        filteredItems={filteredItems}
        totalCount={items.length}
        loading={loading}
        search={search}
        statusFilter={statusFilter}
        deletingId={deletingId}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddFirst={onAddFirst}
      />
    </div>
  );
}
