import { describe, expect, it } from "vitest";
import {
  countLowStock,
  countOutOfStock,
  getStockKind,
  LOW_STOCK_THRESHOLD,
} from "@/lib/stock";

describe("getStockKind", () => {
  it("returns out for zero quantity", () => {
    expect(getStockKind(0)).toBe("out");
  });

  it("returns low below threshold", () => {
    expect(getStockKind(LOW_STOCK_THRESHOLD - 1)).toBe("low");
  });

  it("returns in at or above threshold", () => {
    expect(getStockKind(LOW_STOCK_THRESHOLD)).toBe("in");
  });
});

describe("stock counts", () => {
  it("counts low and out of stock items", () => {
    const items = [
      { quantity: 0 },
      { quantity: 2 },
      { quantity: LOW_STOCK_THRESHOLD },
    ];
    expect(countOutOfStock(items)).toBe(1);
    expect(countLowStock(items)).toBe(1);
  });
});
