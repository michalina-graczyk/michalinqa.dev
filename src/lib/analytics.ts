import type { OverridedMixpanel } from "mixpanel-browser";
import { PUBLIC_MIXPANEL_TOKEN } from "astro:env/client";

type MixpanelWithTracking = OverridedMixpanel & {
  eventsTracked: Array<{
    eventName: string;
    eventProperties?: Record<string, unknown>;
  }>;
};

// Promise-based initialization guard.
// Using a promise instead of a boolean ensures concurrent calls wait for the same init.
// INVARIANT: Consent withdrawal MUST trigger a full page reload to reset this.
let initPromise: Promise<void> | null = null;

// Reset initialization promise on HMR to allow re-initialization during development
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    initPromise = null;
  });
}

/**
 * Initialize Mixpanel analytics.
 * Safe to call multiple times - concurrent calls share the same promise.
 */
export function initAnalytics(): Promise<void> {
  // SSR guard
  if (typeof window === "undefined") return Promise.resolve();

  // Return existing promise if initialization in progress or complete
  if (initPromise) return initPromise;

  initPromise = doInitAnalytics();
  return initPromise;
}

async function doInitAnalytics(): Promise<void> {
  // Dynamic import - Mixpanel SDK only loaded when user consents
  let mixpanel;
  try {
    const module = await import("mixpanel-browser");
    mixpanel = module.default;
  } catch (error) {
    // Import failed (network error, ad blocker, etc.)
    // Reset promise to allow retry on next call
    initPromise = null;
    if (import.meta.env.DEV) {
      console.warn("[Analytics] Failed to load Mixpanel SDK:", error);
    }
    return;
  }

  const isProduction = window.location.hostname === "michalinqa.dev";

  // Expose to window for tracking utility and test harness
  const mp = mixpanel as MixpanelWithTracking;
  mp.eventsTracked = [];
  window.mixpanel = mp;

  // In development/test: set up event tracking mock
  if (!isProduction) {
    const originalTrack = mixpanel.track.bind(mixpanel);
    mixpanel.track = function (
      eventName: string,
      properties?: Record<string, unknown>,
    ) {
      window.mixpanel!.eventsTracked.push({
        eventName,
        eventProperties: properties,
      });
      console.log(
        "[Development] Mixpanel event tracked:",
        eventName,
        properties,
      );
      // Still call original to queue for when SDK loads (won't actually send due to opt_out)
      return originalTrack(eventName, properties);
    };
  }

  mixpanel.init(PUBLIC_MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: isProduction ? "url-with-path" : false,
    persistence: "localStorage",
    ignore_dnt: !isProduction,
    loaded: () => {
      const userId = mixpanel.get_distinct_id();
      mixpanel.identify(userId);

      if (!isProduction) {
        mixpanel.opt_out_tracking();
      }

      // Mark SDK as fully ready and notify tracking utility
      window.mixpanelReady = true;
      window.dispatchEvent(new CustomEvent("mixpanel:ready"));
    },
  });
}
