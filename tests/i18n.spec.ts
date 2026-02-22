import { expect, test } from "@playwright/test";
import { acceptConsentIfVisible } from "./helpers/mixpanel";

test.describe("Internationalization (i18n)", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await acceptConsentIfVisible(page);
  });

  test.describe("Language Toggle", () => {
    test("switches language between PL and EN on homepage", async ({
      page,
      baseURL,
      isMobile,
    }) => {
      // Start on Polish homepage
      await expect(page).toHaveURL(`${baseURL}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", "pl");

      // Open mobile menu if needed
      if (isMobile) {
        await page.locator("#astronav-menu").click();
      }

      // Find and click language toggle
      const langToggle = page.locator('[data-testid="language-toggle"]');
      await expect(langToggle).toBeVisible();
      await langToggle.click();

      // Should be on English homepage
      await expect(page).toHaveURL(`${baseURL}/en`);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");

      // Open mobile menu if needed again (closed after navigation)
      if (isMobile) {
        await page.locator("#astronav-menu").click();
      }

      // Click again
      await langToggle.click();

      // Should be back on Polish homepage
      await expect(page).toHaveURL(`${baseURL}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", "pl");
    });
  });

  test.describe("Symmetric Routing Fallbacks", () => {
    test("switches language symmetrically on untranslated blog posts without 404", async ({
      page,
      baseURL,
      isMobile,
    }) => {
      // Navigate to a Polish-only blog post
      const postSlug = "golden-set"; // A post we know exists
      await page.goto(`${baseURL}/blog/${postSlug}`);
      await acceptConsentIfVisible(page);

      // Verify we are on the Polish version
      await expect(page).toHaveURL(`${baseURL}/blog/${postSlug}`);
      await expect(page.locator("html")).toHaveAttribute("lang", "pl");

      // Ensure the Polish UI wrapper is visible
      await expect(page.getByText("Wróć do bloga")).toBeVisible();

      // Open mobile menu if needed
      if (isMobile) {
        await page.locator("#astronav-menu").click();
      }

      // Find and click language toggle
      const langToggle = page.locator('[data-testid="language-toggle"]');
      await langToggle.click();

      // Verify we are redirected to the English route for the same slug
      await expect(page).toHaveURL(`${baseURL}/en/blog/${postSlug}`);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");

      // Ensure the English UI wrapper is now visible (fallback logic)
      await expect(page.getByText("Back to Blog")).toBeVisible();
    });
  });
});
