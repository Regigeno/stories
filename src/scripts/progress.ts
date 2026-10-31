const KEY = 'lib:progress:v1';

export type NovelProgress = { chapter: number; scroll: number; read: number[]; updated: number };
type Store = Record<string, NovelProgress>;

export const readAll = (): Store => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
};

export const getProgress = (slug: string): NovelProgress | undefined => readAll()[slug];

export const saveProgress = (slug: string, chapter: number, scroll: number) => {
  const all = readAll();
  const prev = all[slug] || { chapter, scroll: 0, read: [], updated: 0 };
  const read = new Set(prev.read);
  if (scroll >= 0.95) read.add(chapter);
  all[slug] = { chapter, scroll, read: [...read].sort((a, b) => a - b), updated: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage unavailable */ }
};

export const novelFraction = (p: NovelProgress | undefined, total: number) => {
  if (!p || !total) return 0;
  const read = new Set(p.read);
  const current = read.has(p.chapter) ? 0 : p.scroll;
  return Math.min(1, (read.size + current) / total);
};
