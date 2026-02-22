import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

/**
 * Get published blog posts (filters out drafts in production)
 */
export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  return getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true,
  );
}

/**
 * Calculate reading time from markdown content body
 * @param body - Raw markdown content body
 * @returns Reading time in minutes
 */
export function calculateReadingTime(body: string): number {
  const wordsPerMinute = 200;
  const words = body.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Get flag emoji for language code
 */
export function getLanguageFlag(lang: "pl" | "en"): string {
  return lang === "pl" ? "🇵🇱" : "🇬🇧";
}

/**
 * Get published blog posts grouped by base slug,
 * prioritizing the target language, with a fallback to the other language.
 */
export async function getGroupedPostsByLang(
  targetLang: "pl" | "en",
): Promise<CollectionEntry<"blog">[]> {
  const allPosts = await getPublishedPosts();
  const grouped = new Map<string, CollectionEntry<"blog">>();

  for (const post of allPosts) {
    const baseSlug = post.id.replace(/-en$/, "");
    const existing = grouped.get(baseSlug);

    if (!existing) {
      grouped.set(baseSlug, post);
    } else if (post.data.lang === targetLang) {
      grouped.set(baseSlug, post);
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}
