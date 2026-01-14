import { defineCollection, z } from 'astro:content';

// Shared schema for all collections
const baseSchema = z.object({
  title: z.string(),
  pubDate: z.coerce.date(),
  description: z.string(),
  tags: z.array(z.string()),
  status: z.enum(['Flop', 'Turn', 'River', '起', '转', '合']).default('Flop'),
  locale: z.enum(['en', 'zh']).optional().default('en'),
  slug: z.string().optional(), // Custom slug for i18n mapping
  draft: z.boolean().default(true),
  book_title: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

// Studio collection - Learning notes, AI, Tech explorations (was AI)
const studioCollection = defineCollection({
  type: 'content',
  schema: baseSchema,
});

// Library collection - books, reflections, taste
const libraryCollection = defineCollection({
  type: 'content',
  schema: baseSchema,
});

// Cafe collection - Personal thoughts, essays, "Manager to IC" (was XR)
const cafeCollection = defineCollection({
  type: 'content',
  schema: baseSchema,
});

// Club collection - Hobbies, Poker, Recreation
const clubCollection = defineCollection({
  type: 'content',
  schema: baseSchema,
});

export const collections = {
  'studio': studioCollection,
  'library': libraryCollection,
  'cafe': cafeCollection,
  'club': clubCollection,
};
