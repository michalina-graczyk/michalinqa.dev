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

    // Wait for Mixpanel to be initialized (async dynamic import)
    await page.waitForFunction(() => window.mixpanelReady === true, {
      timeout: 5000,
    });

    // Consent should be stored
    const consent = await page.evaluate(() =>
      localStorage.getItem("michalinqa:analytics-consent"),
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
      localStorage.getItem("michalinqa:analytics-consent"),
    );
    expect(consent).toBe("rejected");
  });

  test("returning visitor with accepted consent does not see banner", async ({
    page,
    baseURL,
  }) => {
    // Set consent before page loads
    await page.addInitScript(() => {
      localStorage.setItem("michalinqa:analytics-consent", "accepted");
    });
    await page.goto(baseURL!);

    // Banner should not be visible
    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Wait for Mixpanel to be initialized (async dynamic import)
    await page.waitForFunction(() => window.mixpanelReady === true, {
      timeout: 5000,
    });
  });

  test("returning visitor with rejected consent does not see banner", async ({
    page,
    baseURL,
  }) => {
    // Set rejection before page loads
    await page.addInitScript(() => {
      localStorage.setItem("michalinqa:analytics-consent", "rejected");
    });
    await page.goto(baseURL!);

    // Banner should not be visible
    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Mixpanel should NOT be initialized
    const mixpanelExists = await page.evaluate(() => !!window.mixpanel);
    expect(mixpanelExists).toBe(false);
  });

  test("cookie settings button clears consent and reloads page", async ({
    page,
    baseURL,
  }) => {
    // Load page and accept consent normally (not via addInitScript which persists across reloads)
    await page.goto(baseURL!);
    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).toBeVisible();

    // Accept consent
    await page.click('[data-testid="consent-accept"]', { force: true });
    await expect(banner).not.toBeVisible();

    // Wait for Mixpanel to be ready
    await page.waitForFunction(() => window.mixpanelReady === true, {
      timeout: 5000,
    });

    // Click cookie settings button (force to bypass Astro dev toolbar overlay)
    await page.click('[data-testid="cookie-settings"]', { force: true });

    // Page reloads and banner should be visible again
    await expect(banner).toBeVisible();

    // Consent should be cleared
    const consent = await page.evaluate(() =>
      localStorage.getItem("michalinqa:analytics-consent"),
    );
    expect(consent).toBeNull();
  });
});
