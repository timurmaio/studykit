import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("Mobile viewport", () => {
  test("header shows hamburger menu on mobile", async ({ page }) => {
    await page.route(/\/api\/courses/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
    await page.goto("/courses", { waitUntil: "networkidle" });
    await expect(page.locator(".top-panel_menu-btn")).toBeVisible({ timeout: 10000 });
  });

  test("mobile menu opens and closes", async ({ page }) => {
    await page.route(/\/api\/courses/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
    await page.goto("/courses", { waitUntil: "networkidle" });
    await page.locator(".top-panel_menu-btn").click();
    await expect(page.getByRole("dialog", { name: /меню навигации/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /все курсы/i })).toBeVisible();
    await page.locator(".top-panel_drawer-close").click();
    await expect(page.getByRole("dialog", { name: /меню навигации/i })).toBeHidden();
  });

  test("courses page is usable on mobile", async ({ page }) => {
    await page.route(/\/api\/courses/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 1,
            title: "Мобильный курс",
            description: "Тест",
            avatar: null,
            type: "",
            owner: { firstName: "И", lastName: "И" },
            lectures: [],
          },
        ]),
      })
    );
    await page.goto("/courses", { waitUntil: "networkidle" });
    await expect(page.getByText("Мобильный курс")).toBeVisible({ timeout: 10000 });
  });
});
