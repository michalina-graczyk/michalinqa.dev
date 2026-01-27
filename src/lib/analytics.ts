import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = import.meta.env.PUBLIC_MIXPANEL_TOKEN;

export function initAnalytics() {
  if (!MIXPANEL_TOKEN) {
    console.warn("[Analytics] No Mixpanel token configured");
    return;
  }

  const isProduction = window.location.hostname === "michalinqa.dev";

  // Expose to window immediately for inline onclick handlers
  window.mixpanel = mixpanel;

  // In development/test: set up event tracking mock before init
  // This ensures eventsTracked is available before any track() calls
  if (!isProduction) {
    window.mixpanel.eventsTracked = [];
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

  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: isProduction,
    persistence: "localStorage",
    ignore_dnt: !isProduction,
    loaded: () => {
      const userId = mixpanel.get_distinct_id();
      mixpanel.identify(userId);

      if (!isProduction) {
        mixpanel.opt_out_tracking();
      }
    },
  });
}

export { mixpanel };
