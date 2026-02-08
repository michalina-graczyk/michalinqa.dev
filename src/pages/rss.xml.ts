import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPublishedPosts } from "@lib/blog";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  const sortedPosts = posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  return rss({
    title: "Michalina Graczyk - Blog",
    description:
      "Artykuły o LLM Evaluation, AI Testing, Mobile QA i quality engineering. Praktyczne porady i przemyślenia lidera QA.",
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/blog/${post.id}/`,
    })),
  });
}
