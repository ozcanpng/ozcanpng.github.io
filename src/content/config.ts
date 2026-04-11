import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tag: z.enum(['ctf', 'cve', 'tips']),
    difficulty: z.number().min(1).max(5),
    slug: z.string(),
    description: z.string(),
  }),
});

export const collections = { posts };
