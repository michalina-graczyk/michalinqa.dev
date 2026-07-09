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

  test("renders media-appearance cards in the dedicated MediaPresence section", async ({
    page,
  }) => {
    const mp = page.locator('[data-testid="media-presence"]');
    await expect(mp).toBeVisible();
    const cards = mp.locator('[data-testid="media-presence-card"]');
    await expect(cards).not.toHaveCount(0);
  });

  test("each media link points to an external URL with target=_blank", async ({
    page,
  }) => {
    const links = page.locator('[data-testid="media-presence"] a');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute("target", "_blank");
      const href = await link.getAttribute("href");
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test("each media link carries a title attribute", async ({ page }) => {
    const links = page.locator('[data-testid="media-presence"] a');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const title = await links.nth(i).getAttribute("title");
      expect(title?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
