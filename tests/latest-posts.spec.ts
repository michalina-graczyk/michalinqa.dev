import { expect, test } from "@playwright/test";
import { acceptConsentIfVisible } from "./helpers/mixpanel";

test.describe("Homepage LatestPosts section", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await acceptConsentIfVisible(page);
  });

  test("renders between Hero and About", async ({ page }) => {
    const section = page.locator('[data-testid="latest-posts"]');
    await expect(section).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Z bloga" }),
    ).toBeVisible();
  });

  test("shows at most 3 posts (and at least one when posts exist)", async ({
    page,
  }) => {
    const section = page.locator('[data-testid="latest-posts"]');
    const articles = section.locator("article");
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(3);
  });

  test("each post link resolves to /blog/:slug", async ({ page }) => {
    const links = page.locator(
      '[data-testid="latest-posts"] a[data-blog-teaser-link]',
    );
    const n = await links.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toMatch(/^\/blog\/[^/]+$/);
    }
  });

  test('"Wszystkie wpisy" CTA links to /blog', async ({ page }) => {
    const cta = page.locator(
      '[data-testid="latest-posts"] a[data-blog-teaser-view-all]',
    );
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/blog");
  });
});
