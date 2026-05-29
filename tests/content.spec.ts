import { expect, test } from "@playwright/test";
import { acceptConsentIfVisible } from "./helpers/mixpanel";

test.describe("Page Content", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await acceptConsentIfVisible(page);
  });

  test("Website elements are correctly displayed", async ({
    page,
    baseURL,
  }) => {
    await expect(page).toHaveURL(baseURL!);
    await expect(page).toHaveTitle("Michalina Graczyk | Engineering Manager");

    const descriptionMetaTag = page.locator("meta[name='description']");
    await expect(descriptionMetaTag).toHaveAttribute(
      "content",
      "Michalina Graczyk - Engineering Manager w InPost | QA & Test Automation Strategy | AI-driven Testing | LLM Evaluation | Mobile QA",
    );

    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveClass("scroll-smooth");

    const sections = [
      "hero",
      "latest-posts",
      "about",
      "offers",
      "social-proof",
      "contact",
      "footer",
    ];
    for (const section of sections) {
      await expect(page.locator(`[data-testid="${section}"]`)).toBeVisible();
    }
  });

  test("SocialProof media strip shows Testing Station with primary listen link", async ({
    page,
  }) => {
    const sp = page.locator('[data-testid="social-proof"]');
    await expect(sp).toBeVisible();
    await expect(sp.getByText("Testing Station")).toBeVisible();

    const pills = sp.locator('[data-testid="social-proof-media-pill"]');
    await expect(pills).not.toHaveCount(0);
    // The primary link for the Testing Station talk is the YouTube URL
    // (first entry in talk.links in cv.json).
    await expect(pills.first()).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=H9tyKlE9Hzc",
    );
  });

  test("Blog page has correct meta description", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/blog`);
    await acceptConsentIfVisible(page);
    await expect(page).toHaveTitle("Blog | Michalina Graczyk");

    const descriptionMetaTag = page.locator("meta[name='description']");
    await expect(descriptionMetaTag).toHaveAttribute(
      "content",
      "Artykuły o LLM Evaluation, AI Testing, Mobile QA i quality engineering. Praktyczne porady i przemyślenia lidera QA.",
    );
  });

  test.describe("Card Hover Effects", () => {
    test("Card hover effect is applied correctly", async ({ page }) => {
      const firstCard = page.locator('[data-testid="card"]').first();
      await firstCard.hover();
      // Verify essential hover and transition classes are present
      const classAttr = await firstCard.getAttribute("class");
      expect(classAttr).toContain("hover:scale-105");
      expect(classAttr).toContain("hover:shadow-xl");
      expect(classAttr).toContain("transition-all");
      expect(classAttr).toContain("motion-reduce:transition-none");
    });
  });

  test.describe("SocialProof Testimonials", () => {
    test("Testimonials are displayed with correct content", async ({
      page,
    }) => {
      const sp = page.locator('[data-testid="social-proof"]');
      await expect(sp).toBeVisible();

      // Section title (single h2 covers both testimonials and media)
      await expect(sp.locator("h2")).toHaveText("Społeczność");

      // Testimonial cards
      const testimonialCards = sp.locator(
        '[data-testid="social-proof-testimonial"]',
      );
      await expect(testimonialCards).toHaveCount(2);

      // LinkedIn links still present, open in new tab
      const linkedInLinks = sp.locator('a[href*="linkedin.com"]');
      await expect(linkedInLinks).toHaveCount(2);

      for (const link of await linkedInLinks.all()) {
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });
  });
});
