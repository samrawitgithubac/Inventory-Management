import { expect, test } from "@playwright/test";

test.describe("Inventory app", () => {
  test("dashboard loads with heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Welcome to")).toBeVisible();
  });

  test("navigates to add product page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Add Product" }).first().click();
    await expect(page).toHaveURL(/\/products\/new$/);
    await expect(page.getByRole("heading", { name: "Add product" })).toBeVisible();
  });

  test("new product form has required fields", async ({ page }) => {
    await page.goto("/products/new");
    await expect(page.getByLabel(/product name/i)).toBeVisible();
    await expect(page.getByLabel(/quantity/i)).toBeVisible();
    await expect(page.getByLabel(/price/i)).toBeVisible();
  });
});
