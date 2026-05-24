import { getStockKind, LOW_STOCK_THRESHOLD, stockStatusLabel } from "@/lib/stock";
import { formatDate } from "@/lib/format";
import type { Item } from "@/types/item";
import type { StatusFilter } from "@/types/inventory";

export function getQuantityForStatus(value: string) {
  const qty = Number(value);
  return Number.isNaN(qty) || qty < 0 ? 0 : qty;
}

export function filterItems(
  items: Item[],
  search: string,
  statusFilter: StatusFilter,
) {
  const q = search.toLowerCase().trim();
  return items.filter((item) => {
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false);

    const matchesStatus =
      statusFilter === "all" ||
      getStockKind(item.quantity) === statusFilter;

    return matchesSearch && matchesStatus;
  });
}

export function exportItemsCsv(items: Item[]) {
  const header = "Name,Price,Quantity,Status,Date Added\n";
  const rows = items
    .map(
      (i) =>
        `"${i.name}",${i.price},${i.quantity},${stockStatusLabel(i.quantity)},${formatDate(i.createdAt)}`,
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

export function computeInventoryValue(items: Item[]) {
  return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
}

export { LOW_STOCK_THRESHOLD };
