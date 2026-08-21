import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { rejectConsentIfVisible } from "./helpers/mixpanel";

const routes = [
  { name: "home", path: "/" },
  { name: "cv", path: "/cv" },
  { name: "blog", path: "/blog" },
  { name: "offer", path: "/offers/audyt-jakosci" },
  { name: "404", path: "/route-that-does-not-exist" },
] as const;

test.describe("Quality checks", () => {
  test.use({
    colorScheme: "light",
    viewport: { width: 1280, height: 800 },
  });

  for (const route of routes) {
    test(`${route.name} has no accessibility violations`, async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}${route.path}`);

      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test(`${route.name} matches the visual baseline`, async ({
      page,
      baseURL,
    }, testInfo) => {
      // Keep one stable baseline. Accessibility checks still run in every project.
      test.skip(
        testInfo.project.name !== "Chromium",
        "Visual baseline project",
      );
      await page.goto(`${baseURL}${route.path}`);
      await rejectConsentIfVisible(page);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: false,
        animations: "disabled",
        caret: "hide",
        maxDiffPixelRatio: 0.02,
      });
    });
  }

  test("unknown routes return the custom 404 page", async ({
    page,
    baseURL,
  }) => {
    const response = await page.goto(`${baseURL}/route-that-does-not-exist`);

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeVisible();

    const homeLink = page.getByRole("link", { name: "Wróć na stronę główną" });
    await expect(homeLink).toHaveAttribute("href", "/");
    await homeLink.click();
    await expect(page).toHaveURL(`${baseURL}/`);
  });
});
