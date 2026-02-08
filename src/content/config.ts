import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const offersCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/offers" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    img_alt: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(),
    draft: z.boolean().default(false),
    lang: z.enum(["pl", "en"]).default("en"),
    tags: z.array(z.string()).optional(),
    devtoUrl: z.string().url().optional(),
    canonicalUrl: z.string().url().optional(),
  }),
});

export const collections = {
  offers: offersCollection,
  blog: blogCollection,
};
