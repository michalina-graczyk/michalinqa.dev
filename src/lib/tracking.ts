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
