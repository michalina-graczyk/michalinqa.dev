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

const validEventNames: ReadonlySet<string> = new Set(
  Object.values(TrackingEvents),
);

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

/**
 * Register a callback to run when DOM is ready and on Astro page transitions.
 * Each callback is registered directly without accumulation to prevent memory leaks.
 * Callbacks should use data-tracking-initialized attributes on elements
 * to prevent duplicate event listener registration.
 */
export function onReady(fn: () => void): void {
  if (typeof window === "undefined") return;

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  // Re-run on Astro page transitions
  document.addEventListener("astro:page-load", fn);
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
