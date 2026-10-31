import { getCollection, type CollectionEntry } from 'astro:content';

export type Novel = CollectionEntry<'novels'>;
export type Chapter = CollectionEntry<'chapters'>;
export type Universe = CollectionEntry<'universes'>;

export const LEVEL_LABELS: Record<string, { label: string; blurb: string }> = {
  'all-ages': { label: 'All Ages', blurb: 'Suitable for all readers.' },
  teen: { label: 'Teen 13+', blurb: 'Action peril and mild language. Little graphic content.' },
  mature: { label: 'Mature 16+', blurb: 'Graphic violence, intense peril, and strong language.' },
  adult: { label: 'Adult 18+', blurb: 'Explicit content that is not suitable for younger readers.' },
};

export const STATUS_LABELS: Record<string, string> = {
  planning: 'In development',
  'in-progress': 'Being written',
  complete: 'Complete',
};

export const base = (path = '') => {
  const b = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${b}/${path.replace(/^\//, '')}`;
};

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function getNovels(): Promise<Novel[]> {
  const all = await getCollection('novels');
  return all.sort((a, b) => b.data.added.getTime() - a.data.added.getTime());
}

export async function getChaptersFor(slug: string): Promise<Chapter[]> {
  const all = await getCollection('chapters', (c) => c.id.startsWith(`${slug}/`));
  return all.sort((a, b) => a.data.number - b.data.number);
}

export const novelSlug = (c: Chapter) => c.id.split('/')[0];
export const chapterSlug = (c: Chapter) => c.id.split('/')[1];

export function countWords(text: string) {
  return text.replace(/[*_#>`\\-]/g, ' ').split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 230));
}
