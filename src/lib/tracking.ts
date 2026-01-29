/**
 * Centralized Mixpanel event tracking utility.
 * Provides type-safe event names and a safe tracking function.
 *
 * Event properties use PascalCase (e.g., Item, Name) for backwards
 * compatibility with existing Mixpanel data.
 *
 * Note: This module depends on analytics.ts being initialized first.
 * Events tracked before mixpanel is ready are queued and flushed
 * once mixpanel becomes available (via 'mixpanel:ready' event).
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

const validEventNames = new Set(Object.values(TrackingEvents));

/**
 * Check if a string is a valid event name.
 */
export function isValidEventName(value: string): value is EventName {
  return validEventNames.has(value as EventName);
}

/**
 * SSR-safe browser environment check.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// Queue for events tracked after consent but before Mixpanel SDK finishes loading.
// This handles the small window between initAnalytics() call and the loaded callback.
// Note: Events before consent are dropped (not queued) for GDPR compliance.
const MAX_QUEUE_SIZE = 100;
const eventQueue: Array<{ event: EventName; properties?: EventProperties }> =
  [];

/**
 * Flush queued events to mixpanel.
 */
function flushEventQueue(): void {
  if (!isBrowser() || !window.mixpanelReady || !window.mixpanel) return;

  while (eventQueue.length > 0 && window.mixpanel) {
    const { event, properties } = eventQueue.shift()!;
    window.mixpanel.track(event, properties);
  }
}

// Set up listener for mixpanel ready event (fired by analytics.ts)
// Flush immediately if already initialized, otherwise listen once for the event
if (isBrowser()) {
  if (window.mixpanelReady) {
    flushEventQueue();
  } else {
    window.addEventListener("mixpanel:ready", flushEventQueue, { once: true });
  }
}

/**
 * Track an event with Mixpanel.
 * Safely handles SSR (no-op) and queues events if mixpanel isn't ready yet.
 *
 * GDPR: If user hasn't given consent yet or rejected, window.mixpanel won't exist.
 * Events before consent are intentionally dropped (not queued) for GDPR compliance.
 */
export function track(event: EventName, properties?: EventProperties): void {
  if (!isBrowser()) return;

  // No mixpanel = no consent given (or rejected) - drop event for GDPR compliance
  if (!window.mixpanel) {
    if (import.meta.env.DEV) {
      console.debug("[Tracking] Event dropped (no consent):", event);
    }
    return;
  }

  if (window.mixpanelReady) {
    window.mixpanel.track(event, properties);
  } else if (eventQueue.length < MAX_QUEUE_SIZE) {
    eventQueue.push({ event, properties });
  } else if (import.meta.env.DEV) {
    console.warn("[Tracking] Event queue full, dropping event:", event);
  }
}

// Track which selectors have been registered for astro:page-load.
// This prevents listener accumulation if/when Astro View Transitions are enabled.
// Note: View Transitions are not currently used, but this forward-compatible
// implementation avoids refactoring when they are added.
// Listeners attached to DOM elements are cleaned up when elements are removed.
// Global event listeners persist but are idempotent (one per selector).
const registeredSelectors = new Set<string>();

// Track callback IDs for onReady to prevent duplicate astro:page-load listeners
const registeredCallbackIds = new Set<string>();

/**
 * Register a callback to run when DOM is ready and on Astro page transitions.
 * Use data-tracking-initialized attributes on elements to prevent
 * duplicate event listener registration.
 *
 * @param fn - Callback to execute
 * @param id - Optional unique identifier to prevent duplicate listeners across page transitions
 */
export function onReady(fn: () => void, id?: string): void {
  if (!isBrowser()) return;

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  // For View Transitions: register astro:page-load listener only once per id
  if (id) {
    if (!registeredCallbackIds.has(id)) {
      registeredCallbackIds.add(id);
      document.addEventListener("astro:page-load", fn);
    }
  } else {
    // Without an id, always add the listener (caller accepts potential duplicates)
    document.addEventListener("astro:page-load", fn);
  }
}

/**
 * Helper to attach click tracking to elements matching a selector.
 * Handles deduplication via:
 * - data-tracking-initialized attribute (prevents duplicate listeners on elements)
 * - registeredSelectors Set (prevents duplicate astro:page-load listeners)
 */
export function trackClick(
  selector: string,
  event: EventName,
  properties?: EventProperties | ((el: Element) => EventProperties),
): void {
  if (!isBrowser()) return;

  const attach = () => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.hasAttribute("data-tracking-initialized")) return;
      el.setAttribute("data-tracking-initialized", "true");
      el.addEventListener("click", () => {
        const props =
          typeof properties === "function" ? properties(el) : properties;
        track(event, props);
      });
    });
  };

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState !== "loading") {
    attach();
  } else {
    document.addEventListener("DOMContentLoaded", attach, { once: true });
  }

  // For View Transitions: register astro:page-load listener only once per selector
  if (!registeredSelectors.has(selector)) {
    registeredSelectors.add(selector);
    document.addEventListener("astro:page-load", attach);
  }
}
