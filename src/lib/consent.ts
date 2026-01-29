/**
 * Analytics consent management for GDPR compliance.
 * Stores consent state in localStorage.
 */

const CONSENT_KEY = "michalinqa:analytics-consent";

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

/**
 * Clear consent state (for GDPR withdrawal).
 * After calling this, the consent banner should be shown again.
 */
export function clearConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_KEY);
}
