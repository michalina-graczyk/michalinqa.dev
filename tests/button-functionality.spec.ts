import { expect, test } from "@playwright/test";
import {
  expectLastEventToBeTracked,
  getTrackedEvents,
} from "./helpers/mixpanel";

test.describe("Button Functionality", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test("Back-to-top button functionality", async ({ page }) => {
    const documentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    await page.evaluate((height) => {
      window.scrollTo(0, height);
    }, documentHeight);

    await page.waitForFunction(
      (height) => Math.abs(window.scrollY - height) <= 5,
      documentHeight - viewportHeight,
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

  test("Email button functionality", async ({ page }) => {
    const buttonLocator = "text=Napisz maila";
    const href = await page.getAttribute(buttonLocator, "href");
    expect(href).toBe("mailto:michalina@graczyk.dev");

    await page.click(buttonLocator);

    const mixpanelEventsTracked = await getTrackedEvents(page);
    expectLastEventToBeTracked(
      mixpanelEventsTracked,
      "Contact by mail button clicked",
    );
  });

  test("Meeting button functionality", async ({ page }) => {
    const buttonLocator = "text=Umów spotkanie";

    await page.click(buttonLocator);

    const calendlyPopup = await page.waitForSelector(".calendly-popup-content");
    expect(calendlyPopup).toBeTruthy();

    const dataUrl = await calendlyPopup.getAttribute("data-url");
    expect(dataUrl).toEqual(
      expect.stringContaining(
        "https://calendly.com/michalina_graczyk/konsultacje",
      ),
    );

    const mixpanelEventsTracked = await getTrackedEvents(page);
    expectLastEventToBeTracked(
      mixpanelEventsTracked,
      "Contact by Calendly button clicked",
    );
  });

  test("Learn more button functionality", async ({ page }) => {
    const buttonLocator = "text=Dowiedz się więcej";
    const href = await page.getAttribute(buttonLocator, "href");
    expect(href).toBe("#about");

    await page.click(buttonLocator);

    const mixpanelEventsTracked = await getTrackedEvents(page);
    expectLastEventToBeTracked(
      mixpanelEventsTracked,
      "Learn more button clicked",
    );
  });

  test("Social buttons functionality", async ({ page }) => {
    const socials = ["github", "linkedin", "x", "instagram"];

    for (let i = 0; i < socials.length; i++) {
      const name = socials[i];
      // Use partial aria-label match since labels are now more descriptive (e.g., "Odwiedź mój profil na GitHub")
      const social = page.locator(`[aria-label*="${name}" i]`);

      const href = await social.getAttribute("href");
      expect(href).not.toBeNull();

      await social.click();

      const mixpanelEventsTracked = await getTrackedEvents(page);
      expectLastEventToBeTracked(
        mixpanelEventsTracked,
        "Social media button clicked",
        { Name: name },
      );
    }
  });
});
