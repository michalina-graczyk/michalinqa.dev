import { expect, test } from "@playwright/test";

test.describe("GDPR Consent Flow", () => {
  // Each test gets a fresh browser context with clean localStorage by default

  test("shows consent banner on first visit", async ({ page, baseURL }) => {
    await page.goto(baseURL!);

    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).toBeVisible();

    // Mixpanel should NOT be initialized yet
    const mixpanelExists = await page.evaluate(() => !!window.mixpanel);
    expect(mixpanelExists).toBe(false);
  });

  test("accepting consent initializes Mixpanel and hides banner", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);

    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).toBeVisible();

    // Click accept (force to bypass Astro dev toolbar overlay)
    await page.click('[data-testid="consent-accept"]', { force: true });

    // Banner should hide
    await expect(banner).not.toBeVisible();

    // Mixpanel should now be initialized
    const mixpanelReady = await page.evaluate(() => window.mixpanelReady);
    expect(mixpanelReady).toBe(true);

    // Consent should be stored
    const consent = await page.evaluate(() =>
      localStorage.getItem("analytics-consent"),
    );
    expect(consent).toBe("accepted");
  });

  test("rejecting consent hides banner without initializing Mixpanel", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);

    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).toBeVisible();

    // Click reject (force to bypass Astro dev toolbar overlay)
    await page.click('[data-testid="consent-reject"]', { force: true });

    // Banner should hide
    await expect(banner).not.toBeVisible();

    // Mixpanel should NOT be initialized
    const mixpanelExists = await page.evaluate(() => !!window.mixpanel);
    expect(mixpanelExists).toBe(false);

    // Consent should be stored
    const consent = await page.evaluate(() =>
      localStorage.getItem("analytics-consent"),
    );
    expect(consent).toBe("rejected");
  });

  test("returning visitor with accepted consent does not see banner", async ({
    page,
    baseURL,
  }) => {
    // Simulate prior consent
    await page.goto(baseURL!);
    await page.evaluate(() =>
      localStorage.setItem("analytics-consent", "accepted"),
    );

    // Reload page
    await page.reload();

    // Banner should not be visible
    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Mixpanel should be initialized
    const mixpanelReady = await page.evaluate(() => window.mixpanelReady);
    expect(mixpanelReady).toBe(true);
  });

  test("returning visitor with rejected consent does not see banner", async ({
    page,
    baseURL,
  }) => {
    // Simulate prior rejection
    await page.goto(baseURL!);
    await page.evaluate(() =>
      localStorage.setItem("analytics-consent", "rejected"),
    );

    // Reload page
    await page.reload();

    // Banner should not be visible
    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Mixpanel should NOT be initialized
    const mixpanelExists = await page.evaluate(() => !!window.mixpanel);
    expect(mixpanelExists).toBe(false);
  });
});
