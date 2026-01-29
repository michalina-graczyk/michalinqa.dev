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
 * Best-effort cleanup before page reload - the reload is what truly resets state.
 * Call this instead of clearConsent() when user actively withdraws consent.
 */
export function withdrawConsent(): void {
  clearConsent();
  if (typeof window === "undefined") return;

  // Stop the event queue from flushing first
  window.mixpanelReady = false;

  // Best-effort cleanup of Mixpanel state before reload
  // Note: Code holding a reference to window.mixpanel could theoretically still track,
  // but the immediate page reload that follows makes this a non-issue in practice.
  if (window.mixpanel) {
    window.mixpanel.opt_out_tracking();
    window.mixpanel.reset(); // Clears Mixpanel's localStorage data and distinct_id
    window.mixpanel = undefined;
  }
}
