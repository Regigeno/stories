import { getCollection } from 'astro:content';

export async function GET() {
  const novels = await getCollection('novels');
  const chapters = await getCollection('chapters');
  const entries = chapters.map((c) => {
    const [novel, chapter] = c.id.split('/');
    return {
      novel,
      novelTitle: novels.find((n) => n.id === novel)?.data.title ?? novel,
      chapter,
      number: c.data.number,
      title: c.data.title,
      text: (c.body ?? '').replace(/^\s*(\* \* \*|---)\s*$/gm, ' ').replace(/[*_]/g, '').replace(/\s+/g, ' ').trim(),
    };
  });
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } });
}
