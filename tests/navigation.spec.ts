import { expect, test } from "@playwright/test";
import {
  expectLastEventToBeTracked,
  getTrackedEvents,
  TrackingEvents,
} from "./helpers/mixpanel";

test.describe("Page Navigation", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test.describe("Brand Navigation", () => {
    test("Brand text is visible and links to homepage", async ({
      page,
      baseURL,
    }) => {
      const brandLink = page.locator('header a[href="/"]').first();
      await expect(brandLink).toBeVisible();
      await expect(brandLink).toContainText("Michalina");
      await expect(brandLink).toContainText("Graczyk");

      // Navigate away first, then click brand to go home
      await page.goto(`${baseURL}/blog`);
      await brandLink.click();
      await expect(page).toHaveURL(baseURL!);
    });

    test("Brand click tracks Mixpanel event", async ({ page, baseURL }) => {
      // Navigate to blog page first
      await page.goto(`${baseURL}/blog`);
      const brandLink = page.locator('header a[href="/"]').first();

      // Prevent navigation so we can capture the event before page changes
      await page.evaluate(() => {
        document
          .querySelector('header a[href="/"]')
          ?.addEventListener("click", (e) => e.preventDefault(), {
            capture: true,
          });
      });

      await brandLink.click();

      const mixpanelEventsTracked = await getTrackedEvents(page);
      expectLastEventToBeTracked(
        mixpanelEventsTracked,
        TrackingEvents.NAVIGATION_ITEM_CLICKED,
        {
          item: "Brand",
        },
      );
    });
  });

  test.describe("Mobile Navigation", () => {
    test("Menu icon and items are visible on mobile", async ({
      page,
      isMobile,
    }) => {
      if (isMobile) {
        const menuIcon = page.locator("#astronav-menu");
        await expect(menuIcon).toBeVisible();
        // Navigation links no longer have generic aria-label - use nav li a selector
        const menuItems = page.locator("nav ul li a");
        await expect(menuItems).toHaveCount(5);
      }
    });

    test("Mobile hamburger has minimum 44x44px touch target", async ({
      page,
      isMobile,
    }) => {
      if (isMobile) {
        const menuIcon = page.locator("#astronav-menu svg");
        const boundingBox = await menuIcon.boundingBox();
        expect(boundingBox).not.toBeNull();
        expect(boundingBox!.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox!.height).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test.describe("Desktop Navigation", () => {
    test("Hash navigation works and tracks events", async ({
      page,
      isMobile,
      baseURL,
    }) => {
      const navigationHeader = page.locator('[data-testid="header"]');
      if (!isMobile) {
        await expect(navigationHeader).toBeVisible();
        const hashNavItems = [
          { name: "O mnie", nav: "/#about" },
          { name: "Oferta", nav: "/#offers" },
          { name: "Kontakt", nav: "/#contact" },
        ];

        for (const item of hashNavItems) {
          await navigationHeader.locator(`:text("${item.name}")`).click();
          await expect(page).toHaveURL(`${baseURL}${item.nav}`);

          const mixpanelEventsTracked = await getTrackedEvents(page);
          expectLastEventToBeTracked(
            mixpanelEventsTracked,
            TrackingEvents.NAVIGATION_ITEM_CLICKED,
            { item: item.name },
          );
        }
      }
    });

    test("Page navigation works", async ({ page, isMobile, baseURL }) => {
      const navigationHeader = page.locator('[data-testid="header"]');
      if (!isMobile) {
        await expect(navigationHeader).toBeVisible();
        const pageNavItems = [
          { name: "CV", nav: "/cv" },
          { name: "Blog", nav: "/blog" },
        ];

        for (const item of pageNavItems) {
          await navigationHeader.locator(`:text("${item.name}")`).click();
          const expectedUrlPattern = new RegExp(
            `${baseURL}${item.nav}/?$`,
            "i",
          );
          await expect(page).toHaveURL(expectedUrlPattern);
        }
      }
    });
  });

  test.describe("Active Page States", () => {
    test("Homepage highlights only 'O mnie' as default section", async ({
      page,
      isMobile,
    }) => {
      if (!isMobile) {
        // Only "O mnie" should be highlighted as the default homepage section
        const oMnieLink = page.locator('nav a:has-text("O mnie")');
        await expect(oMnieLink).toHaveAttribute("aria-current", "page");

        // Other hash links should not be highlighted
        const otherHashItems = ["Oferta", "Kontakt"];
        for (const item of otherHashItems) {
          const navLink = page.locator(`nav a:has-text("${item}")`);
          await expect(navLink).not.toHaveAttribute("aria-current", "page");
        }
      }
    });

    test("Blog page shows Blog nav item as active", async ({
      page,
      isMobile,
      baseURL,
    }) => {
      if (!isMobile) {
        await page.goto(`${baseURL}/blog`);
        const blogLink = page.locator('nav a:has-text("Blog")');
        await expect(blogLink).toHaveAttribute("aria-current", "page");

        // Other non-hash items should not be active
        const cvLink = page.locator('nav a:has-text("CV")');
        await expect(cvLink).not.toHaveAttribute("aria-current", "page");
      }
    });

    test("CV page shows CV nav item as active", async ({
      page,
      isMobile,
      baseURL,
    }) => {
      if (!isMobile) {
        await page.goto(`${baseURL}/cv`);
        const cvLink = page.locator('nav a:has-text("CV")');
        await expect(cvLink).toHaveAttribute("aria-current", "page");

        // Blog should not be active
        const blogLink = page.locator('nav a:has-text("Blog")');
        await expect(blogLink).not.toHaveAttribute("aria-current", "page");
      }
    });

    test("Nested blog post highlights Blog nav item", async ({
      page,
      isMobile,
      baseURL,
    }) => {
      if (!isMobile) {
        // First get a blog post URL from the blog page
        await page.goto(`${baseURL}/blog`);
        const firstBlogPost = page.locator("article a").first();
        const postExists = (await firstBlogPost.count()) > 0;

        if (postExists) {
          await firstBlogPost.click();
          // Should be on a nested route like /blog/some-post
          await expect(page).toHaveURL(/\/blog\/.+/);

          // Blog nav item should still be active
          const blogLink = page.locator('nav a:has-text("Blog")');
          await expect(blogLink).toHaveAttribute("aria-current", "page");
        }
      }
    });

    test("Active nav items have orange underline styling", async ({
      page,
      isMobile,
      baseURL,
    }) => {
      if (!isMobile) {
        await page.goto(`${baseURL}/blog`);
        const blogLink = page.locator('nav a:has-text("Blog")');
        await expect(blogLink).toHaveClass(/border-b-2/);
        await expect(blogLink).toHaveClass(/border-orange/);
      }
    });
  });
});
