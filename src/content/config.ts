import { defineCollection, z } from 'astro:content';

// Shared schema for all collections
const baseSchema = z.object({
  title: z.string(),
  pubDate: z.coerce.date(),
  description: z.string(),
  tags: z.array(z.string()),
  status: z.enum(['seed', 'sapling', 'evergreen']),
  locale: z.enum(['en', 'zh']).optional().default('en'),
  slug: z.string().optional(), // Custom slug for i18n mapping
});

// AI collection - explorations, code, dev thoughts
const aiCollection = defineCollection({
  type: 'content',
  schema: baseSchema,
});

// Library collection - books, reflections, taste
const libraryCollection = defineCollection({
  type: 'content',
  schema: baseSchema,
});

// XR collection - VR/AR research, spatial computing
const xrCollection = defineCollection({
  type: 'content',
  schema: baseSchema,
});

export const collections = {
  'ai': aiCollection,
  'library': libraryCollection,
  'xr': xrCollection,
};
