import type { Mixpanel, Dict } from "mixpanel-browser";

interface CalendlyWidget {
  initPopupWidget: (options: { url: string }) => void;
}

declare global {
  interface Window {
    mixpanel: Mixpanel & {
      eventsTracked: { eventName: string; eventProperties?: Dict }[];
    };
    Calendly: CalendlyWidget;
  }
}
