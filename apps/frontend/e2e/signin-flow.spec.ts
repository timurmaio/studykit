import { test, expect } from "@playwright/test";

test.describe("SignIn flow", () => {
  test("signin page loads and shows form", async ({ page }) => {
    await page.goto("/signin", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /с возвращением/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/пароль/i)).toBeVisible();
    await expect(page.locator("#signin-form-submit")).toBeVisible();
  });

  test("signin with mocked API redirects to courses", async ({ page }) => {
    await page.route(/\/api\/users\/login/, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 1,
            firstName: "Test",
            lastName: "User",
            email: "test@test.com",
            role: "student",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(/\/api\/users\/me/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          firstName: "Test",
          lastName: "User",
          email: "test@test.com",
          role: "student",
        }),
      });
    });

    await page.goto("/signin", { waitUntil: "networkidle" });
    await page.getByPlaceholder(/example@mail\.com/i).fill("test@test.com");
    await page.getByPlaceholder("••••••").fill("password123");
    await page.locator("#signin-form-submit").click();

    await expect(page).toHaveURL(/\/courses/, { timeout: 5000 });
  });
});
