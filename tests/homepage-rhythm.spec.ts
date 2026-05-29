import { expect, test } from "@playwright/test";
import { acceptConsentIfVisible } from "./helpers/mixpanel";

test.describe("Homepage section rhythm", () => {
  test.describe("Hero tightening", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("LatestPosts H2 is within viewport on 1280x800 desktop", async ({
      page,
      baseURL,
    }) => {
      await page.goto(baseURL!);
      await acceptConsentIfVisible(page);

      const heading = page
        .locator('[data-testid="latest-posts"]')
        .getByRole("heading", { level: 2 });
      const box = await heading.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeLessThan(800);
    });
  });

  test.describe("About no longer claims full viewport", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("About section height is well under 100vh on desktop", async ({
      page,
      baseURL,
    }) => {
      await page.goto(baseURL!);
      await acceptConsentIfVisible(page);

      const about = page.locator('[data-testid="about"]');
      const box = await about.boundingBox();
      expect(box).not.toBeNull();
      // Before this refactor About used lg:min-h-dvh = 800px. Anything below
      // that proves the claim was dropped.
      expect(box!.height).toBeLessThan(800);
    });
  });

  test.describe("Anchor-zone backgrounds", () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await page.goto(baseURL!);
      await acceptConsentIfVisible(page);
    });

    const tintedSections = [
      "latest-posts",
      "offers",
      "social-proof",
    ] as const;

    for (const id of tintedSections) {
      test(`'${id}' carries the tinted background class`, async ({ page }) => {
        const section = page.locator(`[data-testid="${id}"]`);
        await expect(section).toHaveClass(/bg-gray-50/);
        await expect(section).toHaveClass(/dark:bg-gray-950/);
      });
    }

    const anchorSections = ["hero", "about", "contact"] as const;
    for (const id of anchorSections) {
      test(`'${id}' does NOT carry the tinted background class`, async ({
        page,
      }) => {
        const section = page.locator(`[data-testid="${id}"]`);
        const cls = (await section.getAttribute("class")) ?? "";
        expect(cls).not.toMatch(/\bbg-gray-50\b/);
        expect(cls).not.toMatch(/\bdark:bg-gray-950\b/);
      });
    }
  });
});
