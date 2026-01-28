/**
 * Centralized Mixpanel event tracking utility.
 * Provides type-safe event names and a safe tracking function.
 *
 * Event properties use PascalCase (e.g., Item, Name) for backwards
 * compatibility with existing Mixpanel data.
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

const validEventNames = new Set<string>(Object.values(TrackingEvents));

/**
 * Check if a string is a valid EventName at runtime.
 * Use this when event names come from DOM attributes or other untyped sources.
 */
export function isValidEventName(value: string | null): value is EventName {
  return value !== null && validEventNames.has(value);
}

/**
 * Track an event with Mixpanel.
 * Safely handles SSR (no-op when window/mixpanel not available).
 */
export function track(
  event: EventName,
  properties?: Record<string, string | number | boolean>,
): void {
  if (typeof window !== "undefined" && window.mixpanel) {
    window.mixpanel.track(event, properties);
  }
}

// Single shared handler for all onReady callbacks to prevent listener accumulation
const pendingInitializers: Array<() => void> = [];
let pageLoadHandlerRegistered = false;

function runAllInitializers() {
  pendingInitializers.forEach((init) => init());
}

/**
 * Register a callback to run when DOM is ready and on Astro page transitions.
 * Uses a single shared page-load listener to prevent memory leaks.
 * The callback should use data-tracking-initialized attributes on elements
 * to prevent duplicate event listener registration.
 */
export function onReady(fn: () => void): void {
  if (typeof window === "undefined") return;

  pendingInitializers.push(fn);

  // Register single shared handler for page transitions
  if (!pageLoadHandlerRegistered) {
    pageLoadHandlerRegistered = true;
    document.addEventListener("astro:page-load", runAllInitializers);
  }

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  }
}

/**
 * Helper to attach click tracking to elements matching a selector.
 * Handles deduplication via data-tracking-initialized attribute.
 * Use for elements with static event names.
 */
export function trackClick(
  selector: string,
  event: EventName,
  properties?:
    | Record<string, string | number | boolean>
    | ((el: Element) => Record<string, string | number | boolean>),
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
