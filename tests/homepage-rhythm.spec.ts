import { expect, test } from "@playwright/test";
import { acceptConsentIfVisible } from "./helpers/mixpanel";

test.describe("Homepage section rhythm", () => {
  test.describe("Hero tightening", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("LatestPosts H2 is within viewport on 1280x800 desktop", async ({
      page,
      baseURL,
    }) => {
      await page.goto(baseURL!);
      await acceptConsentIfVisible(page);

      const heading = page
        .locator('[data-testid="latest-posts"]')
        .getByRole("heading", { level: 2 });
      const box = await heading.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeLessThan(800);
    });
  });
});
