import { loadNovels, countWords } from './lib.mjs';

for (const n of loadNovels()) {
  console.log(`\n${n.data.title} (${n.slug}), target ${n.data.targetWords ?? '?'}`);
  let total = 0;
  for (const c of n.chapters) {
    const w = countWords(c.body);
    total += w;
    console.log(`  ${String(c.number).padStart(2)}  ${String(w).padStart(5)}  ${w < 2000 ? 'UNDER 2000  ' : ''}${c.title}`);
  }
  console.log(`  total ${total}`);
}
