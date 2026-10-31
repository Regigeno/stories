import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const CONTENT_LEVELS = ['all-ages', 'teen', 'mature', 'adult'] as const;

const novels = defineCollection({
  loader: glob({
    base: './library',
    pattern: '*/novel.md',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    genres: z.array(z.string()).min(1),
    tags: z.array(z.string()).default([]),
    contentLevel: z.enum(CONTENT_LEVELS),
    contentNotes: z.array(z.string()).default([]),
    universe: z.string().optional(),
    status: z.enum(['planning', 'in-progress', 'complete']).default('planning'),
    targetWords: z.number().default(40000),
    added: z.coerce.date(),
  }),
});

const chapters = defineCollection({
  loader: glob({
    base: './library',
    pattern: '*/chapters/*.md',
    generateId: ({ entry }) => entry.replace('/chapters/', '/').replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    number: z.number().int().positive(),
    status: z.enum(['draft', 'final']).default('draft'),
    pov: z.string().optional(),
  }),
});

const universes = defineCollection({
  loader: glob({
    base: './universes',
    pattern: '*/universe.md',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
  }),
});

export const collections = { novels, chapters, universes };
