import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Re-export TrackingEvents for use in tests
export { TrackingEvents } from "../../src/lib/tracking";

export async function getTrackedEvents(page: Page) {
  return await page.evaluate(() => window.mixpanel.eventsTracked);
}

export function expectLastEventToBeTracked(
  events: typeof window.mixpanel.eventsTracked,
  eventName: string,
  eventProperties?: Record<string, unknown>,
) {
  const lastEvent = events[events.length - 1];
  expect(lastEvent).toEqual({ eventName, eventProperties });
}
