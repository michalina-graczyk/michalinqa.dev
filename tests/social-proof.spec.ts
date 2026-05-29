import { expect, test } from "@playwright/test";
import { acceptConsentIfVisible } from "./helpers/mixpanel";

test.describe("Homepage SocialProof section", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await acceptConsentIfVisible(page);
  });

  test("renders one SocialProof section replacing Testimonials + Media", async ({
    page,
  }) => {
    const sp = page.locator('[data-testid="social-proof"]');
    await expect(sp).toBeVisible();
    await expect(page.locator('[data-testid="testimonials"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="media"]')).toHaveCount(0);
  });

  test("has exactly one section heading", async ({ page }) => {
    const sp = page.locator('[data-testid="social-proof"]');
    await expect(sp.locator("h2")).toHaveCount(1);
  });

  test("renders 2 testimonial cards", async ({ page }) => {
    const sp = page.locator('[data-testid="social-proof"]');
    await expect(
      sp.locator('[data-testid="social-proof-testimonial"]'),
    ).toHaveCount(2);
  });

  test("renders a media-appearance pill per talk in cv.json", async ({
    page,
  }) => {
    const sp = page.locator('[data-testid="social-proof"]');
    const pills = sp.locator('[data-testid="social-proof-media-pill"]');
    await expect(pills).not.toHaveCount(0);
    const count = await pills.count();
    for (let i = 0; i < count; i++) {
      const pill = pills.nth(i);
      await expect(pill).toHaveAttribute("target", "_blank");
      const href = await pill.getAttribute("href");
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test("each media pill carries the talk summary as a title attribute", async ({
    page,
  }) => {
    const pills = page.locator('[data-testid="social-proof-media-pill"]');
    const count = await pills.count();
    for (let i = 0; i < count; i++) {
      const title = await pills.nth(i).getAttribute("title");
      expect(title?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
