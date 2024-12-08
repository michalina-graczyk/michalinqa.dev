import { expect, test } from "@playwright/test";
import {
  expectLastEventToBeTracked,
  getTrackedEvents,
} from "./helpers/mixpanel";

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
        const menuItems = page.locator(
          "nav li a[aria-label='navigation link']"
        );
        await expect(menuItems).toHaveCount(5);
      }
    });
  });

  test.describe("Desktop Navigation", () => {
    test("Hash navigation works and tracks events", async ({
      page,
      isMobile,
      baseURL,
    }) => {
      const navigationHeader = page.locator('[data-testid="header"]');
      if (!isMobile) {
        await expect(navigationHeader).toBeVisible();
        const hashNavItems = [
          { name: "O mnie", nav: "/#about" },
          { name: "Oferta", nav: "/#offers" },
          { name: "Kontakt", nav: "/#contact" },
        ];

        for (const item of hashNavItems) {
          await navigationHeader.locator(`:text("${item.name}")`).click();
          await expect(page).toHaveURL(`${baseURL}${item.nav}`);

          const mixpanelEventsTracked = await getTrackedEvents(page);
          expectLastEventToBeTracked(
            mixpanelEventsTracked,
            "Menu item clicked",
            { Item: item.name }
          );
        }
      }
    });

    test("Page navigation works", async ({ page, isMobile, baseURL }) => {
      const navigationHeader = page.locator('[data-testid="header"]');
      if (!isMobile) {
        await expect(navigationHeader).toBeVisible();
        const pageNavItems = [
          { name: "CV", nav: "/cv" },
          { name: "Blog", nav: "/blog" },
        ];

        for (const item of pageNavItems) {
          await navigationHeader.locator(`:text("${item.name}")`).click();
          const expectedUrlPattern = new RegExp(
            `${baseURL}${item.nav}/?$`,
            "i"
          );
          await expect(page).toHaveURL(expectedUrlPattern);
        }
      }
    });
  });
});
