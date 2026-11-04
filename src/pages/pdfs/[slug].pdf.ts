import type { APIRoute } from 'astro';
import { loadNovels } from '../../../scripts/lib.mjs';
import { renderNovelPdf } from '../../../scripts/pdf.mjs';

export function getStaticPaths() {
  return loadNovels()
    .filter((n) => n.chapters.length > 0)
    .map((n) => ({ params: { slug: n.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const novel = loadNovels().find((n) => n.slug === params.slug);
  if (!novel || novel.chapters.length === 0) return new Response('Not found', { status: 404 });
  const pdf = await renderNovelPdf(novel);
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${novel.slug}.pdf"`,
    },
  });
};
