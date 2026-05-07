import { emailAddress } from "@config/contact";

/**
 * Shared helpers for the offers collection.
 * Keep this in sync with `mode: "waitlist"` semantics in `src/content.config.ts`.
 *
 * `mode` is the single source of truth for waitlist state. The `WAITLIST_TAG`
 * constant exists only so we can defensively filter the literal "Waitlista"
 * string out of frontmatter `tags[]` (in case anyone keeps it around) — the
 * UI should never render it as a normal tag.
 */
export const WAITLIST_TAG = "Waitlista";

export function isWaitlistTag(tag: string): boolean {
  return tag.toLowerCase() === WAITLIST_TAG.toLowerCase();
}

/**
 * Tags array minus any defensive "Waitlista" entry. The waitlist visual
 * (WaitlistBadge) is driven by `mode === "waitlist"`, not by tag presence,
 * so we never want to render the literal tag.
 */
export function tagsWithoutWaitlist(
  tags: readonly string[] | undefined,
): string[] {
  if (!tags) return [];
  return tags.filter((tag) => !isWaitlistTag(tag));
}

/**
 * Default email subject for the waitlist CTA. Used when frontmatter does not
 * override `waitlistSubject`.
 */
export function buildWaitlistSubject(title: string): string {
  return `Waitlista - ${title}`;
}

/**
 * Build a `mailto:` href for the waitlist CTA.
 *
 * RFC 6068 specifies bare `\n` (encoded as `%0A`) as the body line break.
 * Using `\r\n` (`%0D%0A`) leaks `%0D` into the body and renders as a visible
 * artifact / double break in some clients (older Apple Mail, Thunderbird in
 * certain configs). Stick to `\n`.
 */
export function buildWaitlistMailto(title: string, subject?: string): string {
  const finalSubject = subject ?? buildWaitlistSubject(title);
  const body = `Cześć Michalino,\n\nchciał(a)bym dołączyć do listy oczekujących na: ${title}.\n\nKrótko o mnie / czego szukam:\n\n`;
  return `mailto:${emailAddress.replace(/^mailto:/, "")}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(body)}`;
}
