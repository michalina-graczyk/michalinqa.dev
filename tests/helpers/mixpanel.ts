import { Page, expect } from "@playwright/test";
import type { Dict } from "mixpanel-browser";

export async function getTrackedEvents(page: Page) {
  return await page.evaluate(() => window.mixpanel.eventsTracked);
}

export function expectLastEventToBeTracked(
  events: typeof window.mixpanel.eventsTracked,
  eventName: string,
  eventProperties?: Dict
) {
  const lastEvent = events[events.length - 1];
  expect(lastEvent).toEqual({ eventName, eventProperties });
}
