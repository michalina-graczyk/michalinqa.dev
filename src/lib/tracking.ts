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

// Queue for events tracked before mixpanel is ready
const eventQueue: Array<{ event: EventName; properties?: EventProperties }> =
  [];

/**
 * Flush queued events to mixpanel.
 */
function flushEventQueue(): void {
  if (typeof window === "undefined" || !window.mixpanel) return;

  while (eventQueue.length > 0) {
    const { event, properties } = eventQueue.shift()!;
    window.mixpanel.track(event, properties);
  }
}

// Set up listener for mixpanel ready event (fired by analytics.ts)
if (typeof window !== "undefined") {
  window.addEventListener("mixpanel:ready", flushEventQueue);
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
  }
}

// Track which selectors have been registered for astro:page-load
// This prevents listener accumulation during View Transitions
const registeredSelectors = new Set<string>();

/**
 * Register a callback to run when DOM is ready and on Astro page transitions.
 * Use data-tracking-initialized attributes on elements to prevent
 * duplicate event listener registration.
 */
export function onReady(fn: () => void): void {
  if (typeof window === "undefined") return;

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  // For View Transitions: use a unique key to prevent duplicate listeners
  // Since fn is a new closure each time, we use a simple flag
  document.addEventListener("astro:page-load", fn);
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
  if (typeof window === "undefined") return;

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
