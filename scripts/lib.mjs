import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const libraryDir = path.join(root, 'library');

export const LEVELS = {
  'all-ages': 'All Ages',
  teen: 'Teen 13+',
  mature: 'Mature 16+',
  adult: 'Adult 18+',
};

export function loadNovels() {
  if (!fs.existsSync(libraryDir)) return [];
  return fs
    .readdirSync(libraryDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(libraryDir, d.name, 'novel.md')))
    .map((d) => {
      const dir = path.join(libraryDir, d.name);
      const novel = matter(fs.readFileSync(path.join(dir, 'novel.md'), 'utf8'));
      const chaptersDir = path.join(dir, 'chapters');
      const chapters = fs.existsSync(chaptersDir)
        ? fs
            .readdirSync(chaptersDir)
            .filter((f) => f.endsWith('.md'))
            .map((f) => {
              const parsed = matter(fs.readFileSync(path.join(chaptersDir, f), 'utf8'));
              return { file: f, ...parsed.data, body: parsed.content.trim() };
            })
            .sort((a, b) => a.number - b.number)
        : [];
      return { slug: d.name, data: novel.data, blurb: novel.content.trim(), chapters };
    });
}

export const countWords = (text) => text.replace(/[*_#>`\\]/g, ' ').replace(/^\s*(\* \* \*|---)\s*$/gm, ' ').split(/\s+/).filter(Boolean).length;
