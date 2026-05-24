import { describe, expect, it } from "vitest";
import { parseItemId, validateItemBody } from "@/lib/validators/item";

describe("parseItemId", () => {
  it("parses valid numeric ids", () => {
    expect(parseItemId("42")).toBe(42);
  });

  it("returns null for invalid ids", () => {
    expect(parseItemId("abc")).toBeNull();
    expect(parseItemId("-1")).toBeNull();
  });
});

describe("validateItemBody", () => {
  it("accepts valid payloads", () => {
    const result = validateItemBody({
      name: "Widget",
      description: "  A widget  ",
      quantity: "10",
      price: "19.99",
      imageUrl: null,
      imagePublicId: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Widget");
      expect(result.data.description).toBe("A widget");
      expect(result.data.quantity).toBe(10);
      expect(result.data.price).toBe("19.99");
    }
  });

  it("rejects missing name", () => {
    const result = validateItemBody({
      name: "   ",
      quantity: 1,
      price: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
    }
  });

  it("rejects negative quantity", () => {
    const result = validateItemBody({
      name: "Widget",
      quantity: -1,
      price: 1,
    });
    expect(result.success).toBe(false);
  });
});
