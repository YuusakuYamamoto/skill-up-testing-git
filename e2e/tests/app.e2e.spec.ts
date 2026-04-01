import { test, expect } from "@playwright/test";

test.describe("Frontend", () => {
  test("トップページが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Vite|frontend/i);
  });

  test("Reactのロゴが表示される", async ({ page }) => {
    await page.goto("/");
    // Vite + React テンプレートのデフォルト要素
    const logo = page.locator("img[alt='Vite logo'], svg, .logo").first();
    await expect(logo).toBeVisible();
  });
});
