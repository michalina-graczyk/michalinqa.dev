import type { Mixpanel, Dict } from "mixpanel-browser";

declare global {
  interface Window {
    mixpanel: Mixpanel & {
      eventsTracked: { eventName: string; eventProperties?: Dict }[];
    };
  }
}
