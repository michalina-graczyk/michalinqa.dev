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
    mixpanel: OverridedMixpanel & {
      eventsTracked: TrackedEvent[];
    };
    /** Set to true once Mixpanel SDK is fully initialized (loaded callback fired) */
    mixpanelReady?: boolean;
    Calendly: CalendlyWidget;
  }
}
