import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Re-export TrackingEvents and EventName for use in tests
export { TrackingEvents, type EventName } from "../../src/lib/tracking";
import type { EventName } from "../../src/lib/tracking";

export async function getTrackedEvents(page: Page) {
  return await page.evaluate(() => window.mixpanel.eventsTracked);
}

export function expectLastEventToBeTracked(
  events: typeof window.mixpanel.eventsTracked,
  eventName: EventName,
  eventProperties?: Record<string, unknown>,
) {
  const lastEvent = events[events.length - 1];
  expect(lastEvent).toEqual({ eventName, eventProperties });
}
