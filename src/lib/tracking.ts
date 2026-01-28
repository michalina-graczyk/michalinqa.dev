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

// Queue for events tracked before mixpanel is ready
const eventQueue: Array<{ event: EventName; properties?: EventProperties }> =
  [];

/**
 * Flush queued events to mixpanel.
 */
function flushEventQueue(): void {
  if (!isBrowser() || !window.mixpanel) return;

  while (eventQueue.length > 0) {
    const { event, properties } = eventQueue.shift()!;
    window.mixpanel.track(event, properties);
  }
}

// Set up listener for mixpanel ready event (fired by analytics.ts)
// Also flush immediately if mixpanel is already initialized (handles race condition)
if (isBrowser()) {
  window.addEventListener("mixpanel:ready", flushEventQueue);
  if (window.mixpanel) {
    flushEventQueue();
  }
}

/**
 * Track an event with Mixpanel.
 * Safely handles SSR (no-op) and queues events if mixpanel isn't ready yet.
 */
export function track(event: EventName, properties?: EventProperties): void {
  if (!isBrowser()) return;

  if (window.mixpanel) {
    // Flush any queued events first to maintain order
    flushEventQueue();
    window.mixpanel.track(event, properties);
  } else {
    // Queue event for when mixpanel becomes available
    eventQueue.push({ event, properties });
  }
}

// Track which selectors have been registered for astro:page-load
// This prevents listener accumulation during View Transitions.
// Note: Listeners are never removed. This is acceptable because:
// 1. Only one listener per unique selector
// 2. If elements don't exist after navigation, querySelectorAll returns empty (no-op)
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
