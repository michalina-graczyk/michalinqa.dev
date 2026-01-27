import { expect, test } from "@playwright/test";

test.describe("Page Content", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
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

    const sections = ["hero", "about", "offers", "contact", "footer"];
    for (const section of sections) {
      await expect(page.locator(`[data-testid="${section}"]`)).toBeVisible();
    }
  });

  test("Blog page has correct meta description", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/blog`);
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
});
