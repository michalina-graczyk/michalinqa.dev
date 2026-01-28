/**
 * Centralized Mixpanel event tracking utility.
 * Provides type-safe event names and a safe tracking function.
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
 * The callback should use data-tracking-initialized attributes on elements
 * to prevent duplicate event listener registration.
 */
export function onReady(fn: () => void): void {
  if (typeof window === "undefined") return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }

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
