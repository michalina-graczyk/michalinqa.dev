/**
 * Analytics consent management for GDPR compliance.
 * Stores consent state in localStorage.
 */

export const CONSENT_KEY = "michalinqa:analytics-consent";

export type ConsentState = "accepted" | "rejected" | null;

/**
 * Get the current consent state.
 * Returns null if no decision has been made yet.
 */
export function getConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (value === "accepted" || value === "rejected") return value;
    return null;
  } catch {
    // localStorage unavailable (private browsing, storage quota, etc.)
    // Returning null means banner will show - safest GDPR-compliant behavior
    return null;
  }
}

/**
 * Set the consent state.
 */
export function setConsent(value: "accepted" | "rejected"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Silent fail - consent won't persist, user will see banner again next visit
  }
}

/**
 * Clear consent state (for GDPR withdrawal).
 * After calling this, the consent banner should be shown again.
 */
export function clearConsent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Silent fail - localStorage unavailable
  }
}

/**
 * Withdraw consent and immediately stop all tracking.
 * This ensures no events are tracked between withdrawal and page reload.
 * Call this instead of clearConsent() when user actively withdraws consent.
 */
export function withdrawConsent(): void {
  clearConsent();
  if (typeof window === "undefined") return;

  // Immediately stop tracking - don't wait for reload
  if (window.mixpanel) {
    window.mixpanel.reset(); // Clears Mixpanel's localStorage data and distinct_id
    window.mixpanel = undefined;
  }
  window.mixpanelReady = false;
}
