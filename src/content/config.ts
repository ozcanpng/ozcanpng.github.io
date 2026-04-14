import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tag: z.enum(['ctf', 'cve', 'tips', 'pwn']),
    difficulty: z.number().int().min(1).max(5),
    description: z.string().optional(),
  }),
});

export const collections = { posts };
