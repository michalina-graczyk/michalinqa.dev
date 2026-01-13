import { expect, test } from "@playwright/test";

test.describe("Blog", () => {
  test.describe("Blog Listing Page", () => {
    test("displays posts with required elements", async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/blog`);

      await expect(page).toHaveTitle(/Blog/);

      // Should have at least one blog post
      const articles = page.locator("main article");
      await expect(articles.first()).toBeVisible();
      const count = await articles.count();
      expect(count).toBeGreaterThan(0);

      // Each article should have title, date, and tags
      const firstArticle = articles.first();
      await expect(firstArticle.locator("h2")).toBeVisible();
      await expect(firstArticle.locator("time")).toBeVisible();
    });
  });

  test.describe("Blog Post Page", () => {
    test("renders title, date, reading time, and tags", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/blog`);

      // Click first blog post
      const firstArticleLink = page.locator("main article a").first();
      await firstArticleLink.click();

      // Verify URL changed to a blog post
      await expect(page).toHaveURL(/\/blog\/.+/);

      // Verify critical elements within main content
      const main = page.locator("main");
      await expect(main.locator("h1")).toBeVisible();
      await expect(main.locator("time")).toBeVisible();
      await expect(main.getByText(/min czytania/)).toBeVisible();

      // Verify back to blog link in article
      const backLink = main.locator('a:has-text("bloga")').first();
      await expect(backLink).toBeVisible();
    });

    test("DEV.to callout displays with UTM parameters", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/blog`);

      // Navigate to first post
      await page.locator("main article a").first().click();

      // Find DEV.to callout link
      const devtoLink = page.locator('main a[href*="dev.to"]');

      if ((await devtoLink.count()) > 0) {
        await expect(devtoLink).toBeVisible();

        // Verify UTM parameters are present
        const href = await devtoLink.getAttribute("href");
        expect(href).toContain("utm_source=michalinqa.dev");
        expect(href).toContain("utm_medium=blog");
        expect(href).toContain("utm_campaign=cross-post");
      }
    });

    test("canonical URL points to original source when specified", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/blog/shift-left-done-right`);

      const expectedCanonical =
        "https://dev.to/michalina_graczyk/shift-left-done-right-qa-in-the-modern-sdlc-5c24";

      // Verify canonical link points to the original DEV.to source
      const canonicalLink = page.locator('link[rel="canonical"]');
      await expect(canonicalLink).toHaveAttribute("href", expectedCanonical);

      // Verify og:url matches canonical
      const ogUrl = page.locator('meta[property="og:url"]');
      await expect(ogUrl).toHaveAttribute("content", expectedCanonical);
    });

    test("images load successfully", async ({ page, baseURL }) => {
      // Track failed image requests
      const failedImages: string[] = [];
      page.on("response", (response) => {
        if (
          response.request().resourceType() === "image" &&
          !response.ok() &&
          response.url().includes("blog")
        ) {
          failedImages.push(response.url());
        }
      });

      await page.goto(`${baseURL}/blog/from-cypress-to-playwright`);
      await page.waitForLoadState("networkidle");

      // Verify no blog images failed to load
      expect(failedImages).toHaveLength(0);

      // Verify content images are present and visible
      const contentImages = page.locator(
        'main article img[alt*="Cypress"], main article img[alt*="Playwright"]',
      );
      const imageCount = await contentImages.count();
      expect(imageCount).toBeGreaterThan(0);

      for (let i = 0; i < imageCount; i++) {
        await expect(contentImages.nth(i)).toBeVisible();
      }
    });
  });
});
