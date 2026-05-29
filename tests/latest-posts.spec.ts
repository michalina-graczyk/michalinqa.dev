import { expect, test } from "@playwright/test";
import {
  acceptConsentIfVisible,
  expectLastEventToBeTracked,
  getTrackedEvents,
  TrackingEvents,
} from "./helpers/mixpanel";

test.describe("Homepage LatestPosts section", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await acceptConsentIfVisible(page);
  });

  test("renders in DOM order: Hero → LatestPosts → About", async ({ page }) => {
    const section = page.locator('[data-testid="latest-posts"]');
    await expect(section).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Z bloga" }),
    ).toBeVisible();

    const order = await page.evaluate(() => {
      const ids = ["hero", "latest-posts", "about"];
      const tops = ids.map((id) => {
        const el =
          document.querySelector(`[data-testid="${id}"]`) ??
          document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      });
      return tops;
    });
    expect(order[0]).not.toBeNull();
    expect(order[1]).not.toBeNull();
    expect(order[2]).not.toBeNull();
    expect(order[0]!).toBeLessThan(order[1]!);
    expect(order[1]!).toBeLessThan(order[2]!);
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
      // Allow nested slugs defensively (post.id may include subpaths in future).
      expect(href).toMatch(/^\/blog\/.+/);
    }
  });

  test('"Wszystkie wpisy" CTA links to /blog', async ({ page }) => {
    const cta = page.locator(
      '[data-testid="latest-posts"] a[data-blog-teaser-view-all]',
    );
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/blog");
  });

  test("each post exposes ISO datetime and sr-only language label", async ({
    page,
  }) => {
    const articles = page.locator('[data-testid="latest-posts"] article');
    const n = await articles.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const article = articles.nth(i);
      const iso = await article.locator("time").getAttribute("datetime");
      expect(iso).not.toBeNull();
      // ISO 8601 with Z (toISOString() output)
      expect(iso!).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(iso!).toString()).not.toBe("Invalid Date");

      const srOnly = article.locator(".sr-only");
      const srText = (await srOnly.first().textContent())?.trim() ?? "";
      expect(srText).toMatch(/Wpis po polsku|Post in English/);
    }
  });

  test("clicking a post title tracks Blog Teaser Clicked with slug and position", async ({
    page,
  }) => {
    const link = page
      .locator('[data-testid="latest-posts"] a[data-blog-teaser-link]')
      .first();
    const slug = await link.getAttribute("data-slug");
    expect(slug).not.toBeNull();

    // Prevent navigation so we can inspect the tracked event.
    await page.evaluate(() => {
      document.addEventListener(
        "click",
        (e) => {
          const t = e.target as HTMLElement;
          if (t.closest("a[data-blog-teaser-link]")) e.preventDefault();
        },
        true,
      );
    });

    await link.click();
    const events = await getTrackedEvents(page);
    expectLastEventToBeTracked(events, TrackingEvents.BLOG_TEASER_CLICKED, {
      slug,
      position: 0,
    });
  });
});
