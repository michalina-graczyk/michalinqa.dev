import { expect, test } from "@playwright/test";
import {
  acceptConsentIfVisible,
  expectLastEventToBeTracked,
  getTrackedEvents,
  TrackingEvents,
} from "./helpers/mixpanel";

test.describe("Newsletter Signup", () => {
  test("Newsletter form is visible in the Contact section on landing page", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);
    const newsletterSection = page.locator('[data-testid="newsletter-signup"]');

    await expect(newsletterSection).toBeVisible();
    await expect(
      newsletterSection.locator('input[type="email"]'),
    ).toBeVisible();
    await expect(
      newsletterSection.locator('button[type="submit"]'),
    ).toBeVisible();
  });

  test("Newsletter form is visible at the bottom of blog posts", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/blog/ach-ta-niedeterministycznosc`);
    const newsletterSection = page.locator('[data-testid="newsletter-signup"]');

    await expect(newsletterSection).toBeVisible();
    await expect(
      page.getByText("Praktycznie o testowaniu, procesach QA"),
    ).toBeVisible();
  });

  test("Newsletter form posts to the correct Buttondown endpoint", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);
    const form = page.locator('[data-testid="newsletter-signup"] form');

    await expect(form).toHaveAttribute(
      "action",
      "https://buttondown.com/api/emails/embed-subscribe/michalinqa",
    );
    await expect(form).toHaveAttribute("method", "post");
    await expect(form).toHaveAttribute("target", "popupwindow");
    await expect(form.locator('input[name="embed"]')).toHaveAttribute(
      "value",
      "1",
    );
  });

  test("Clicking subscribe tracks event in Mixpanel", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);
    await acceptConsentIfVisible(page);

    // Intercept form submission to avoid hitting third-party API
    await page.route("**/buttondown.com/**", (route) => route.abort());

    const newsletterSection = page.locator('[data-testid="newsletter-signup"]');
    const emailInput = newsletterSection.locator('input[type="email"]');
    const submitButton = newsletterSection.locator('button[type="submit"]');

    await emailInput.fill("test@example.com");
    await submitButton.click();

    const events = await getTrackedEvents(page);
    expectLastEventToBeTracked(
      events,
      TrackingEvents.NEWSLETTER_SIGNUP_CLICKED,
    );
  });
});
