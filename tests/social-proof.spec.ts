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

  test("each media card links to an external URL with target=_blank", async ({
    page,
  }) => {
    const cards = page.locator('[data-testid="media-presence-card"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute("target", "_blank");
      const href = await card.getAttribute("href");
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test("each media card carries the talk summary as a title attribute", async ({
    page,
  }) => {
    const cards = page.locator('[data-testid="media-presence-card"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const title = await cards.nth(i).getAttribute("title");
      expect(title?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
