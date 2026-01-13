import { defineCollection, z } from "astro:content";

const offersCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    link: z.string(),
    img_alt: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  offers: offersCollection,
  blog: blogCollection,
};
