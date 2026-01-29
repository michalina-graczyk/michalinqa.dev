import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { EventName } from "../../src/lib/tracking";

// Re-export TrackingEvents and EventName for use in tests
export { TrackingEvents, type EventName } from "../../src/lib/tracking";

/**
 * Accept analytics consent if the banner is visible.
 * This initializes Mixpanel so tracking tests can work.
 * Uses force:true to bypass Astro dev toolbar overlay in development.
 * Waits for Mixpanel to be fully initialized after accepting.
 */
export async function acceptConsentIfVisible(page: Page) {
  const banner = page.locator('[data-testid="consent-banner"]');
  if (await banner.isVisible().catch(() => false)) {
    // Force click to bypass Astro dev toolbar which overlays the banner in dev mode
    await page.click('[data-testid="consent-accept"]', { force: true });
    await expect(banner).not.toBeVisible();
    // Wait for Mixpanel to be fully initialized (async dynamic import)
    await page.waitForFunction(() => window.mixpanelReady === true, {
      timeout: 5000,
    });
  }
}

export async function getTrackedEvents(page: Page) {
  return await page.evaluate(() => window.mixpanel?.eventsTracked ?? []);
}

export function expectLastEventToBeTracked(
  events: NonNullable<typeof window.mixpanel>["eventsTracked"],
  eventName: EventName,
  eventProperties?: Record<string, unknown>,
) {
  const lastEvent = events[events.length - 1];
  expect(lastEvent).toEqual({ eventName, eventProperties });
}
