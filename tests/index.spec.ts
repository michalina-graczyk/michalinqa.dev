import { expect, test } from "@playwright/test";

test.describe("Page Navigation", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test.describe("Mobile Navigation", () => {
    test("Menu icon and items are visible on mobile", async ({
      page,
      isMobile,
    }) => {
      if (isMobile) {
        const menuIcon = page.locator("#astronav-menu");
        await expect(menuIcon).toBeVisible();
        const menuItems = page.locator(".astronav-toggle");
        await expect(menuItems).toHaveCount(3);
      }
    });
  });

  test.describe("Desktop Navigation", () => {
    test("Navigation header and items are correctly displayed and functional", async ({
      page,
      isMobile,
      baseURL,
    }) => {
      const navigationHeader = page.locator('[data-testid="header"]');
      if (!isMobile) {
        await expect(navigationHeader).toBeVisible();
        const navItems = ["About", "Projects", "Contact"];
        for (const item of navItems) {
          await navigationHeader.locator(`:text("${item}")`).click();
          await expect(page).toHaveURL(`${baseURL}#${item.toLowerCase()}`);
        }
      }
    });
  });
});

test.describe("Page Content", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test("Website elements are correctly displayed", async ({
    page,
    baseURL,
  }) => {
    await expect(page).toHaveURL(baseURL!);
    await expect(page).toHaveTitle("A Very Descriptive Title");

    const descriptionMetaTag = page.locator("meta[name='description']");
    await expect(descriptionMetaTag).toHaveAttribute(
      "content",
      "A heavily optimized description full of well-researched keywords."
    );

    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveClass("scroll-smooth");

    const sections = ["hero", "about", "projects", "contact", "footer"];
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
