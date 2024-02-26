import { expect, test } from "@playwright/test";

test.describe("Button Functionality", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test("Back-to-top button functionality", async ({ page }) => {
    const documentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    await page.evaluate((height) => {
      window.scrollTo(0, height);
    }, documentHeight);

    await page.waitForFunction(
      (height) => Math.abs(window.scrollY - height) <= 5,
      documentHeight - viewportHeight
    );

    const backToTopButton = page.locator('[data-testid="back-to-top-button"]');
    await backToTopButton.click();

    await page.waitForFunction(() => window.scrollY === 0);

    const scrollTopPosition = await page.evaluate(() => window.scrollY);
    expect(scrollTopPosition).toBe(0);
  });

  test("Theme toggle button functionality", async ({ page, isMobile }) => {
    if (!isMobile) {
      const themeToggleButton = page.locator('[data-testid="theme-switch"]');
      await themeToggleButton.click();
      await expect(page.locator("html")).toHaveClass("scroll-smooth dark");

      await page.evaluate(() => {
        window.localStorage.setItem("theme", "dark");
      });

      await themeToggleButton.click();
      await expect(page.locator("html")).toHaveClass("scroll-smooth");

      await page.evaluate(() => {
        window.localStorage.removeItem("theme");
      });
    }
  });
});