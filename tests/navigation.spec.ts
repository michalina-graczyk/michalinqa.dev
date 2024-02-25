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
        const navItems = [
          { name: "O mnie", nav: "about" },
          { name: "Oferta", nav: "offers" },
          { name: "Kontakt", nav: "contact" },
        ];
        for (const item of navItems) {
          await navigationHeader.locator(`:text("${item.name}")`).click();
          await expect(page).toHaveURL(`${baseURL}#${item.nav}`);
        }
      }
    });
  });
});
