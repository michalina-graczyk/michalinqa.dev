import type { Mixpanel } from "mixpanel-browser";

interface CalendlyWidget {
  initPopupWidget: (options: { url: string }) => void;
}

interface TrackedEvent {
  eventName: string;
  eventProperties?: Record<string, unknown>;
}

declare global {
  interface Window {
    mixpanel: Mixpanel & {
      eventsTracked: TrackedEvent[];
    };
    Calendly: CalendlyWidget;
  }
}
