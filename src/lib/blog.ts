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
