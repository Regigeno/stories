import PDFDocument from 'pdfkit';
import { LEVELS } from './lib.mjs';

const FONTS = { regular: 'Times-Roman', italic: 'Times-Italic', bold: 'Times-Bold', boldItalic: 'Times-BoldItalic' };

function smartQuotes(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch !== '"' && ch !== "'") { out += ch; continue; }
    let j = i - 1;
    while (j >= 0 && (s[j] === '*' || s[j] === '_')) j--;
    const prev = j < 0 ? ' ' : s[j];
    const opening = /[\s(\[{\u2014\u2013\u201C\u2018]/.test(prev);
    out += ch === '"' ? (opening ? '\u201C' : '\u201D') : opening ? '\u2018' : '\u2019';
  }
  return out;
}

const clean = (s) =>
  smartQuotes(s)
    .replace(/[\u2010\u2011\u2012]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\xFF\u2013\u2014\u2018-\u201E\u2022\u2026]/g, '');

function segments(text) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ t: text.slice(last, m.index), f: FONTS.regular });
    const tok = m[0];
    if (tok.startsWith('**')) out.push({ t: tok.slice(2, -2), f: FONTS.bold });
    else out.push({ t: tok.slice(1, -1), f: FONTS.italic });
    last = m.index + tok.length;
  }
  if (last < text.length) out.push({ t: text.slice(last), f: FONTS.regular });
  return out.filter((s) => s.t.length);
}

function paragraph(doc, text, opts) {
  const segs = segments(clean(text.replace(/\n/g, ' ')));
  segs.forEach((s, i) => {
    doc.font(s.f).text(s.t, { ...opts, continued: i < segs.length - 1 });
    if (i === 0) opts = { ...opts, indent: 0 };
  });
}

export function renderNovelPdf(novel) {
  const { data, chapters } = novel;
  const doc = new PDFDocument({
    size: [432, 648],
    margins: { top: 60, bottom: 66, left: 54, right: 54 },
    bufferPages: true,
    info: { Title: data.title, Author: 'The Library', Subject: data.tagline },
  });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));

  doc.font(FONTS.bold).fontSize(30).text(clean(data.title), 0, 190, { align: 'center', width: 432 });
  doc.moveDown(0.8).font(FONTS.italic).fontSize(13).text(clean(data.tagline), 54, doc.y, { align: 'center', width: 324 });
  doc.moveDown(2).font(FONTS.regular).fontSize(10).text(data.genres.join('  \u2022  '), { align: 'center', width: 324 });

  doc.addPage();
  doc.font(FONTS.bold).fontSize(13).text('Content level', 54, 90);
  doc.moveDown(0.4).font(FONTS.regular).fontSize(11).text(LEVELS[data.contentLevel] ?? data.contentLevel);
  (data.contentNotes ?? []).forEach((n) => doc.text(`\u2022 ${clean(n)}`, { indent: 10 }));
  if (novel.blurb) {
    doc.moveDown(1.5).font(FONTS.bold).fontSize(13).text('About this book');
    doc.moveDown(0.4).font(FONTS.regular).fontSize(11);
    novel.blurb.split(/\n\s*\n/).forEach((p) => { paragraph(doc, p, { align: 'left' }); doc.moveDown(0.5); });
  }

  for (const ch of chapters) {
    doc.addPage();
    doc.font(FONTS.regular).fontSize(10).text(`CHAPTER ${ch.number}`, 54, 110, { align: 'center', characterSpacing: 2 });
    doc.moveDown(0.4).font(FONTS.bold).fontSize(20).text(clean(ch.title), { align: 'center' });
    doc.moveDown(1.8).fontSize(11.5);

    let afterBreak = true;
    for (const block of ch.body.split(/\n\s*\n/)) {
      const b = block.trim();
      if (!b) continue;
      if (/^(\* \* \*|---|\*\*\*)$/.test(b)) {
        doc.moveDown(0.5).font(FONTS.regular).text('*   *   *', { align: 'center' }).moveDown(0.5);
        afterBreak = true;
        continue;
      }
      if (b.startsWith('## ')) {
        doc.moveDown(0.8).font(FONTS.bold).fontSize(11.5).text(clean(b.slice(3)).toUpperCase(), { align: 'center' }).moveDown(0.6);
        afterBreak = true;
        continue;
      }
      paragraph(doc, b, { align: 'justify', lineGap: 2.5, indent: afterBreak ? 0 : 18 });
      doc.moveDown(0.15);
      afterBreak = false;
    }
  }

  const range = doc.bufferedPageRange();
  for (let i = 2; i < range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0;
    doc.font(FONTS.regular).fontSize(9).text(String(i - 1), 0, 648 - 40, { align: 'center', width: 432, lineBreak: false });
  }
  doc.end();
  return new Promise((res, rej) => {
    doc.on('end', () => res(Buffer.concat(chunks)));
    doc.on('error', rej);
  });
}
