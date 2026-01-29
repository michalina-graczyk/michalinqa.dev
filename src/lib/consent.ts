/**
 * Analytics consent management for GDPR compliance.
 * Stores consent state in localStorage.
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
 * Set the consent state and dispatch an event for listeners.
 * The 'consent:changed' event can be used by external integrations
 * or for debugging/monitoring consent state changes.
 */
export function setConsent(value: "accepted" | "rejected"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent("consent:changed", { detail: value }));
}
