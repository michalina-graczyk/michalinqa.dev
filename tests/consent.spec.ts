import { expect, test } from "@playwright/test";
import { CONSENT_KEY } from "../src/lib/consent";

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
    const consent = await page.evaluate(
      (key) => localStorage.getItem(key),
      CONSENT_KEY,
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
    const consent = await page.evaluate(
      (key) => localStorage.getItem(key),
      CONSENT_KEY,
    );
    expect(consent).toBe("rejected");
  });

  test("returning visitor with accepted consent does not see banner", async ({
    page,
    baseURL,
  }) => {
    // Set consent before page loads
    await page.addInitScript((key) => {
      localStorage.setItem(key, "accepted");
    }, CONSENT_KEY);
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
    await page.addInitScript((key) => {
      localStorage.setItem(key, "rejected");
    }, CONSENT_KEY);
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
    const consent = await page.evaluate(
      (key) => localStorage.getItem(key),
      CONSENT_KEY,
    );
    expect(consent).toBeNull();
  });

  test("handles localStorage errors gracefully", async ({ page, baseURL }) => {
    // Mock localStorage to throw (simulates private browsing mode)
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: () => {
            throw new Error("SecurityError: localStorage not available");
          },
          setItem: () => {
            throw new Error("SecurityError: localStorage not available");
          },
          removeItem: () => {
            throw new Error("SecurityError: localStorage not available");
          },
          // Keep other methods to avoid breaking unrelated code
          clear: () => {},
          key: () => null,
          length: 0,
        },
        writable: true,
      });
    });

    await page.goto(baseURL!);

    // Banner should still show (graceful degradation)
    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).toBeVisible();

    // Page should not crash - we can interact with the banner
    await page.click('[data-testid="consent-accept"]', { force: true });

    // Banner should hide (even though consent won't persist)
    await expect(banner).not.toBeVisible();
  });

  test("events triggered before consent are dropped, not queued", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);

    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).toBeVisible();

    // Verify mixpanel is not initialized before consent
    const mixpanelBefore = await page.evaluate(() => !!window.mixpanel);
    expect(mixpanelBefore).toBe(false);

    // Trigger an event that would normally track - use navigation which is always present
    await page.click('header a[href="/"]', { force: true });

    // Wait for any navigation and go back to homepage
    await page.waitForURL(baseURL!);

    // Now accept consent
    await expect(banner).toBeVisible();
    await page.click('[data-testid="consent-accept"]', { force: true });
    await expect(banner).not.toBeVisible();

    // Wait for Mixpanel to be fully initialized
    await page.waitForFunction(() => window.mixpanelReady === true, {
      timeout: 5000,
    });

    // Verify the pre-consent nav click was dropped (not queued and replayed)
    // Only page view should be tracked (if any), not the navigation click before consent
    const events = await page.evaluate(
      () => window.mixpanel?.eventsTracked ?? [],
    );
    const navEvents = events.filter(
      (e) => e.eventName === "Navigation Item Clicked",
    );
    expect(navEvents).toHaveLength(0);
  });
});
