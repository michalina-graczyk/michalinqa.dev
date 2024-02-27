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
    await expect(page).toHaveTitle(
      "Michalina Graczyk - Specjalistka ds. jakości i komunikacji w IT"
    );

    const descriptionMetaTag = page.locator("meta[name='description']");
    await expect(descriptionMetaTag).toHaveAttribute(
      "content",
      "Liderka QA, Mentorka osób poszukujących swojej drogi w IT. #mentorka #qa #jakość #coaching."
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
        "rounded-xl bg-white p-3 shadow-lg duration-100 hover:scale-105 hover:transform hover:shadow-xl"
      );
    });
  });
});
