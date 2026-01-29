import type { OverridedMixpanel } from "mixpanel-browser";

interface CalendlyWidget {
  initPopupWidget: (options: { url: string }) => void;
}

interface TrackedEvent {
  eventName: string;
  eventProperties?: Record<string, unknown>;
}

declare global {
  interface Window {
    /** Mixpanel instance. Only set if user has accepted analytics consent. */
    mixpanel?: OverridedMixpanel & {
      eventsTracked: TrackedEvent[];
    };
    /** Set to true once Mixpanel SDK is fully initialized (loaded callback fired) */
    mixpanelReady?: boolean;
    /** Set to true when consent is given but SDK is still loading. Used to queue events. */
    analyticsConsentPending?: boolean;
    Calendly: CalendlyWidget;
  }
}
