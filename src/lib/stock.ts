export const LOW_STOCK_THRESHOLD = 5;

export type StockKind = "in" | "low" | "out";

export function getStockKind(quantity: number): StockKind {
  if (quantity === 0) return "out";
  if (quantity < LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

export function countLowStock(items: { quantity: number }[]) {
  return items.filter(
    (i) => i.quantity > 0 && i.quantity < LOW_STOCK_THRESHOLD,
  ).length;
}

export function countOutOfStock(items: { quantity: number }[]) {
  return items.filter((i) => i.quantity === 0).length;
}

export function stockStatusLabel(quantity: number) {
  const kind = getStockKind(quantity);
  if (kind === "in") return "In stock";
  if (kind === "low") return "Low";
  return "Out";
}
