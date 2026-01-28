/**
 * Centralized Mixpanel event tracking utility.
 * Provides type-safe event names and a safe tracking function.
 *
 * Event properties use PascalCase (e.g., Item, Name) for backwards
 * compatibility with existing Mixpanel data.
 *
 * Note: This module depends on analytics.ts being initialized first.
 * Events tracked before mixpanel is ready are queued and flushed
 * once mixpanel becomes available.
 */

export const TrackingEvents = {
  HERO_CTA_CLICKED: "Hero CTA Clicked",
  NAVIGATION_ITEM_CLICKED: "Navigation Item Clicked",
  SOCIAL_LINK_CLICKED: "Social Link Clicked",
  EMAIL_CONTACT_CLICKED: "Email Contact Clicked",
  CALENDLY_BOOKING_OPENED: "Calendly Booking Opened",
  OFFER_EMAIL_CLICKED: "Offer Email Clicked",
  OFFER_BOOKING_CLICKED: "Offer Booking Clicked",
} as const;

export type EventName = (typeof TrackingEvents)[keyof typeof TrackingEvents];

type EventProperties = Record<string, unknown>;

// Queue for events tracked before mixpanel is ready
const eventQueue: Array<{ event: EventName; properties?: EventProperties }> =
  [];
let queueFlushed = false;

/**
 * Flush queued events to mixpanel.
 * Called automatically when mixpanel becomes available.
 */
function flushEventQueue(): void {
  if (queueFlushed || typeof window === "undefined" || !window.mixpanel) return;
  queueFlushed = true;

  while (eventQueue.length > 0) {
    const { event, properties } = eventQueue.shift()!;
    window.mixpanel.track(event, properties);
  }
}

/**
 * Track an event with Mixpanel.
 * Safely handles SSR (no-op) and queues events if mixpanel isn't ready yet.
 */
export function track(event: EventName, properties?: EventProperties): void {
  if (typeof window === "undefined") return;

  if (window.mixpanel) {
    // Flush any queued events first to maintain order
    flushEventQueue();
    window.mixpanel.track(event, properties);
  } else {
    // Queue event for when mixpanel becomes available
    eventQueue.push({ event, properties });
    // Set up a check for when mixpanel becomes available
    scheduleQueueFlush();
  }
}

let flushScheduled = false;

function scheduleQueueFlush(): void {
  if (flushScheduled) return;
  flushScheduled = true;

  // Check periodically until mixpanel is available (max ~5 seconds)
  let attempts = 0;
  const maxAttempts = 50;
  const interval = setInterval(() => {
    attempts++;
    if (window.mixpanel || attempts >= maxAttempts) {
      clearInterval(interval);
      flushScheduled = false;
      if (window.mixpanel) {
        flushEventQueue();
      }
    }
  }, 100);
}

// Callbacks registered via onReady, stored to run on page transitions
const pageLoadCallbacks = new Set<() => void>();
let pageLoadListenerAdded = false;

/**
 * Register a callback to run when DOM is ready and on Astro page transitions.
 * Callbacks should use data-tracking-initialized attributes on elements
 * to prevent duplicate event listener registration.
 */
export function onReady(fn: () => void): void {
  if (typeof window === "undefined") return;

  pageLoadCallbacks.add(fn);

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  // Add astro:page-load listener only once
  if (!pageLoadListenerAdded) {
    pageLoadListenerAdded = true;
    document.addEventListener("astro:page-load", () => {
      pageLoadCallbacks.forEach((cb) => cb());
    });
  }
}

/**
 * Helper to attach click tracking to elements matching a selector.
 * Handles deduplication via data-tracking-initialized attribute.
 */
export function trackClick(
  selector: string,
  event: EventName,
  properties?: EventProperties | ((el: Element) => EventProperties),
): void {
  onReady(() => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.hasAttribute("data-tracking-initialized")) return;
      el.setAttribute("data-tracking-initialized", "true");
      el.addEventListener("click", () => {
        const props =
          typeof properties === "function" ? properties(el) : properties;
        track(event, props);
      });
    });
  });
}
