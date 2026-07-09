import { expect, test } from "@playwright/test";
import { acceptConsentIfVisible } from "./helpers/mixpanel";

test.describe("Homepage section rhythm", () => {

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

    const tintedSections = ["latest-posts", "offers", "social-proof", "media-presence"] as const;

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

  test.describe("Section count and order", () => {
    test("page renders exactly the 7 expected sections in order", async ({
      page,
      baseURL,
    }) => {
      await page.goto(baseURL!);
      await acceptConsentIfVisible(page);

      const expected = [
        "hero",
        "about",
        "media-presence",
        "social-proof",
        "offers",
        "latest-posts",
        "contact",
      ];

      const tops = await page.evaluate((ids) => {
        return ids.map((id) => {
          const el = document.querySelector(`[data-testid="${id}"]`);
          return el ? el.getBoundingClientRect().top + window.scrollY : null;
        });
      }, expected);

      for (let i = 0; i < tops.length; i++) {
        expect(tops[i], `section '${expected[i]}' missing`).not.toBeNull();
      }
      for (let i = 1; i < tops.length; i++) {
        expect(
          tops[i]!,
          `'${expected[i]}' must follow '${expected[i - 1]}'`,
        ).toBeGreaterThan(tops[i - 1]!);
      }
    });
  });
});
