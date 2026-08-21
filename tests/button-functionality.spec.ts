import { expect, test } from "@playwright/test";
import {
  acceptConsentIfVisible,
  expectLastEventToBeTracked,
  getTrackedEvents,
  TrackingEvents,
} from "./helpers/mixpanel";

test.describe("Button Functionality", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await acceptConsentIfVisible(page);
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
    if (isMobile) {
      await page.locator("#astronav-menu").click();
    }
    const themeToggleButton = page.locator('[data-testid="theme-switch"]');
    const themeInput = page.locator("#checkbox");
    await themeToggleButton.click();
    await expect(page.locator("html")).toHaveClass("scroll-smooth dark");
    await expect(themeInput).toHaveAttribute(
      "aria-label",
      "Przełącz na tryb jasny",
    );

    await themeToggleButton.click();
    await expect(page.locator("html")).toHaveClass("scroll-smooth");
    await expect(themeInput).toHaveAttribute(
      "aria-label",
      "Przełącz na tryb ciemny",
    );

    await page.evaluate(() => window.localStorage.removeItem("theme"));
  });

  test("Email button functionality", async ({ page }) => {
    const buttonLocator = "text=Napisz maila";
    const href = await page.getAttribute(buttonLocator, "href");
    expect(href).toBe("mailto:michalina@graczyk.dev");

    await page.click(buttonLocator);

    const mixpanelEventsTracked = await getTrackedEvents(page);
    expectLastEventToBeTracked(
      mixpanelEventsTracked,
      TrackingEvents.EMAIL_CONTACT_CLICKED,
    );
  });

  test("Meeting button functionality", async ({ page }) => {
    const meetingLink = page.getByRole("link", { name: "Umów spotkanie" });

    await expect(meetingLink).toHaveAttribute(
      "href",
      "https://zcal.co/michalina-graczyk/pierwsza-konsultacja",
    );
    await expect(meetingLink).toHaveAttribute("target", "_blank");
    await expect(meetingLink).toHaveAttribute("rel", "noopener noreferrer");

    await meetingLink.click({ modifiers: ["Meta"] });

    const mixpanelEventsTracked = await getTrackedEvents(page);
    expectLastEventToBeTracked(
      mixpanelEventsTracked,
      TrackingEvents.BOOKING_OPENED,
    );
  });

  test("Learn more button functionality", async ({ page }) => {
    const buttonLocator = "text=Sprawdź, jak mogę pomóc";
    const href = await page.getAttribute(buttonLocator, "href");
    expect(href).toBe("#about");

    await page.click(buttonLocator);

    const mixpanelEventsTracked = await getTrackedEvents(page);
    expectLastEventToBeTracked(
      mixpanelEventsTracked,
      TrackingEvents.HERO_CTA_CLICKED,
    );
  });

  test("Social buttons functionality", async ({ page }) => {
    const socials = ["github", "linkedin", "x"];

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
        TrackingEvents.SOCIAL_LINK_CLICKED,
        { Name: name },
      );
    }
  });
});
