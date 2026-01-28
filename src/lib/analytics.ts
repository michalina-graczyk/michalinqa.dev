import mixpanel from "mixpanel-browser";
import { PUBLIC_MIXPANEL_TOKEN } from "astro:env/client";

export function initAnalytics() {
  const isProduction = window.location.hostname === "michalinqa.dev";

  // Expose to window for tracking utility and test harness
  // Type assertion needed because we extend with eventsTracked below
  window.mixpanel = mixpanel as typeof window.mixpanel;
  window.mixpanel.eventsTracked = [];

  // In development/test: set up event tracking mock
  if (!isProduction) {
    const originalTrack = mixpanel.track.bind(mixpanel);
    mixpanel.track = function (
      eventName: string,
      properties?: Record<string, unknown>,
    ) {
      window.mixpanel.eventsTracked.push({
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
