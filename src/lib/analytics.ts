import type { OverridedMixpanel } from "mixpanel-browser";
import { PUBLIC_MIXPANEL_TOKEN } from "astro:env/client";

type MixpanelWithTracking = OverridedMixpanel & {
  eventsTracked: Array<{
    eventName: string;
    eventProperties?: Record<string, unknown>;
  }>;
};

// Module-level flag prevents double initialization regardless of window.mixpanel state.
// INVARIANT: Consent withdrawal MUST trigger a full page reload to reset this flag.
// Do not change the withdrawal flow to SPA navigation without resetting this flag.
let analyticsInitialized = false;

export async function initAnalytics(): Promise<void> {
  // SSR guard
  if (typeof window === "undefined") return;

  // Idempotency guard - prevent double initialization
  if (analyticsInitialized) return;
  analyticsInitialized = true;

  // Dynamic import - Mixpanel SDK only loaded when user consents
  const { default: mixpanel } = await import("mixpanel-browser");

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
