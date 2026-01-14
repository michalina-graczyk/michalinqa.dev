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
      "Michalina Graczyk - Engineering Manager w InPost | QA & Test Automation Strategy | AI-driven Testing | LLM Evaluation",
    );

    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveClass("scroll-smooth");

    const sections = ["hero", "about", "offers", "contact", "footer"];
    for (const section of sections) {
      await expect(page.locator(`[data-testid="${section}"]`)).toBeVisible();
    }
  });

  test.describe("Card Hover Effects", () => {
    test("Card hover effect is applied correctly", async ({ page }) => {
      const firstCard = page.locator('[data-testid="card"]').first();
      await firstCard.hover();
      await expect(firstCard).toHaveClass(
        "flex flex-1 flex-col rounded-xl bg-white dark:bg-gray-800 p-3 shadow-lg dark:shadow-orange/20 duration-100 hover:scale-105 hover:transform hover:shadow-xl",
      );
    });
  });
});
