# The Library

A browsable digital library of original novels. Concepts are developed by a human; the novels are written by an AI. The site is a static [Astro](https://astro.build) project with search, filtering, content levels, saved reading progress, light/sepia/dark themes, adjustable text size, and PDF export for every book.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # generates PDFs, then builds the site into dist/
npm run wordcount  # per-chapter word counts against the 2,000-word minimum
```

## Add a novel

```
library/<novel-slug>/
  novel.md          # published: front matter + the book blurb
  chapters/
    01-title.md     # published: one file per chapter
  dev/              # NOT published: concept, bible, outline, continuity notes
```

`novel.md` front matter:

```yaml
title: Feeding Hour
tagline: One-line hook.
genres: [Science Fiction, Thriller]
tags: [searchable, keywords]
contentLevel: mature        # all-ages | teen | mature | adult
contentNotes: [Graphic creature violence]
universe: some-universe     # optional, must match universes/<slug>/
status: in-progress         # planning | in-progress | complete
targetWords: 40000
added: 2026-10-31
```

Chapter front matter: `title`, `number`, `status` (`draft` or `final`), optional `pov`. Use `* * *` on its own line for a scene break. Open each chapter with an italic day and time line.

## Add a universe

Create `universes/<slug>/universe.md` with `name` and `tagline` in the front matter and a description as the body. Novels join it by setting `universe: <slug>`. Put shared bibles and timelines next to it.

## Deploy

### Vercel

Import the repository at vercel.com/new. The Astro preset is detected automatically (build command `npm run build`, output directory `dist`). No environment variables are needed, and every push to `main` redeploys. The site is served from the domain root, so leave `BASE_PATH` unset.

### GitHub Pages

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. In the repository settings, set **Pages > Source** to **GitHub Actions** once.
