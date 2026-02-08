import { expect, test } from "@playwright/test";
import {
  acceptConsentIfVisible,
  expectLastEventToBeTracked,
  getTrackedEvents,
  TrackingEvents,
} from "./helpers/mixpanel";

test.describe("Newsletter Signup", () => {
  // No universal beforeEach to avoid global timeouts in acceptConsentIfVisible

  test("Newsletter form is visible in the Contact section on landing page", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);
    // We don't strictly need consent for visibility tests
    const contactSection = page.locator('[data-testid="contact"]');
    const newsletterForm = contactSection.locator(
      'form[action*="buttondown.com"]',
    );

    await expect(newsletterForm).toBeVisible();
    await expect(newsletterForm.locator('input[type="email"]')).toBeVisible();
    await expect(newsletterForm.locator('button[type="submit"]')).toBeVisible();
  });

  test("Newsletter form is visible at the bottom of blog posts", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/blog/ach-ta-niedeterministycznosc`);
    // Skip acceptConsentIfVisible here to see if it's the culprit
    const newsletterForm = page.locator('form[action*="buttondown.com"]');
    await expect(newsletterForm).toBeVisible();
    await expect(
      page.getByText("Praktycznie o testowaniu, procesach QA"),
    ).toBeVisible();
  });

  test("Clicking subscribe tracks event in Mixpanel", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);
    // This one REALLY needs consent and tracking to work
    await acceptConsentIfVisible(page).catch(() => {
      console.warn(
        "Failed to accept consent banner in time, continuing anyway...",
      );
    });

    const newsletterForm = page.locator('form[action*="buttondown.com"]');
    const emailInput = newsletterForm.locator('input[type="email"]');
    const submitButton = newsletterForm.locator('button[type="submit"]');

    await emailInput.fill("test@example.com");
    await submitButton.click();

    // Check events with a bit more grace
    await page.waitForTimeout(1000);
    const events = await getTrackedEvents(page);
    const hasEvent = events.some(
      (e) => e.eventName === "Newsletter Signup Clicked",
    );
    expect(hasEvent).toBe(true);
  });
});
