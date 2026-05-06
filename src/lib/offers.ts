/**
 * Shared constants for the offers collection.
 * Keep this in sync with `mode: "waitlist"` semantics in `src/content.config.ts`.
 */
export const WAITLIST_TAG = "Waitlista";

export function isWaitlistTag(tag: string): boolean {
  return tag.toLowerCase() === WAITLIST_TAG.toLowerCase();
}
