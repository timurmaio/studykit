import { test, expect } from "@playwright/test";

const mockCourse = {
  id: 1,
  title: "Тестовый курс",
  description: "Описание",
  avatar: null,
  type: "Практический",
  solvedIds: [],
  createdAt: Date.now() / 1000,
  owner: { firstName: "Иван", lastName: "Петров" },
  lectures: [
    {
      id: 10,
      title: "Раздел 1",
      content: [
        { id: 100, title: "Урок 1", type: "MarkdownContent", body: "# Hello" },
      ],
    },
  ],
};

const mockContent = {
  id: 100,
  title: "Урок 1",
  body: "# Содержимое урока",
  type: "MarkdownContent",
  serial_number: 0,
};

test.describe("Course and content flow", () => {
  test.beforeEach(async ({ page }) => {
    // Use regex to match API URLs (fetch goes to localhost:3100)
    await page.route(/\/api\/users\/me/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          firstName: "Test",
          lastName: "User",
          email: "test@test.com",
          role: "student",
        }),
      })
    );
    await page.route(/\/api\/courses/, (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/api/courses" && route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockCourse]),
        });
      }
      if (url.pathname.match(/^\/api\/courses\/1$/)) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCourse),
        });
      }
      route.continue();
    });
    await page.route(/\/api\/courses\/1\/enrollment/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ participating: true }),
      })
    );
    await page.route(/\/api\/courses\/1\/progress/, (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({ status: 200, body: "{}" });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          completedCount: 0,
          totalContent: 1,
          viewedContentIds: [],
        }),
      });
    });
    await page.route(/\/api\/lectures\/.*\/contents\//, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockContent),
      })
    );
  });

  test("courses page loads and shows course list", async ({ page }) => {
    await page.goto("/courses", { waitUntil: "networkidle" });
    await expect(page.getByText("Тестовый курс")).toBeVisible({ timeout: 10000 });
  });

  test("navigate from courses to course to content", async ({ page }) => {
    await page.goto("/courses", { waitUntil: "networkidle" });
    await expect(page.getByText("Тестовый курс")).toBeVisible({ timeout: 10000 });

    await page.getByText("Тестовый курс").first().click();
    await expect(page).toHaveURL(/\/courses\/1$/);
    await expect(page.getByText("Тестовый курс")).toBeVisible();

    await page.getByText("Урок 1").first().click();
    await expect(page).toHaveURL(/\/lectures\/10\/contents\/100/);
    await expect(page.getByText("Содержимое урока")).toBeVisible({ timeout: 5000 });
  });
});
