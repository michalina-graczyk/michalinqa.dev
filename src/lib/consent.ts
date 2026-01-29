/**
 * Analytics consent management for GDPR compliance.
 * Stores consent state in localStorage.
 *
 * TODO: Add UI to withdraw consent (GDPR Article 7(3) requires this).
 * Could be a "Cookie settings" link in the footer that clears localStorage
 * and shows the banner again.
 */

const CONSENT_KEY = "analytics-consent";

export type ConsentState = "accepted" | "rejected" | null;

/**
 * Get the current consent state.
 * Returns null if no decision has been made yet.
 */
export function getConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

/**
 * Set the consent state.
 */
export function setConsent(value: "accepted" | "rejected"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, value);
}
