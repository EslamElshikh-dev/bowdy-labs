# BOWDY LABS

Arabic-first corporate website for BOWDY LABS, a Riyadh-based technology and artificial intelligence company.

## Experience

- Original SparkNode identity from the reference repository, responsive AI artwork, and a lightweight CSS system hero on the services page
- Arabic and English home and AI-agent experiences
- Ten Saudi-context BOWDY agents with lightweight motion, responsive editorial profiles, and governed-service schema
- Nine connected service capabilities
- Work, insights, about, contact, privacy, and terms pages
- Responsive navigation and mobile bottom bar
- Organization, LocalBusiness, ProfessionalService, OfferCatalog, Service, FAQ, Article, BreadcrumbList, and WebPage structured data
- Sitemap, robots, security.txt, PWA manifest, Open Graph image, and `llms.txt`
- Local Sora and IBM Plex Sans Arabic fonts
- مجلة رياض التقنية at `/riyadh-tech/`: Arabic AI news, explainers, standalone section routes, paginated archives, full search with source filters, per-source pages, device-local reading lists, reader tools, source attribution, RSS, and social cards

## Commands

- `npm run build` — generate the static site into `dist/`
- `npm run validate` — validate metadata, schema, internal links, responsive assets, and the sitemap
- `npm run smoke` — serve `dist/` temporarily and check important routes
- `npm run check` — run syntax checks, build, validation, and smoke tests
- `npm run check:magazine` — validate the built magazine's routes, metadata, dates, sources, RSS, social cards, and internal links
- `npm run serve` — preview `dist/` on port 4173

## Source structure

- `src/content.mjs` — brand, services, work, insights, and contact data
- `src/agents.mjs` — bilingual agent roles, tasks, outcomes, and voice
- `src/agents-page.mjs` — Arabic and English agent showcase templates and structured data
- `src/riyadh-tech-content.mjs` — magazine identity and editorial content; add or update stories here, preserving source dates separately from magazine publication dates
- `src/riyadh-tech-page.mjs` — magazine index, article templates, NewsArticle/BlogPosting schema, and RSS
- `src/riyadh-tech-images.mjs` — locally rendered social cards for the magazine and its stories
- `src/data/riyadh-tech-sources.json` — seven approved official sources, RSS/newsroom fallbacks, hourly cadence, a seven-day recovery window, and an eight-story per-run batch
- `src/data/riyadh-tech-news.json` — append-only input for automatic news publication; the scheduled publisher updates this file through GitHub and Vercel deploys the resulting commit
- `src/riyadh-tech-news.mjs` — validates the publication payload, dates, source domains, canonical URL duplicates, Arabic summaries, and trusted Hugging Face authors; creates stable article URLs and author attribution
- `build.mjs` — static page templates, structured data, and SEO files
- `assets/css/main.css` — responsive visual system
- `assets/js/main.js` — navigation, filters, reveals, accordion, and project brief
- `assets/brand/` — vector brand mark
- `assets/media/` — hero artwork and responsive agent portraits
- `assets/og/` — social sharing artwork

## Deployment

Vercel runs `npm run build`, serves the generated `dist/` directory, and publishes production from the `main` branch at https://bowdylabs.com.

## Automatic magazine publication

The hourly ChatGPT automation reads the approved source registry and existing news from GitHub, checks RSS or the official newsroom, opens each original announcement, and appends new Arabic summaries to `src/data/riyadh-tech-news.json`. It writes only this data file, using its current content SHA to avoid overwriting concurrent changes. Publication is performed through the connected GitHub/Vercel accounts and does not require a new model API key or a public write endpoint.

Each record contains `sourceId`, `sourceUrl`, `sourceTitle`, `eventDate` (the original announcement date), `publishedAt` (the actual magazine publication timestamp with timezone), `title`, `excerpt`, and `paragraphs` (one to three paragraphs, at most 140 words total). Preserve existing records and publication times. Never substitute the time of discovery for the source date. An invalid, duplicate, future-dated, or unapproved-source payload fails the build while the previous production deployment remains available.

Automatic briefs are visibly labeled and identify the automatic desk as author. NewsArticle metadata, RSS timestamps, sitemap entries, related articles, search and source-specific social cards update during the normal build. Social-image generation is bounded to the editorial set plus the approved sources, rather than regenerating an image for every archived news item. The source list is also visible within the magazine and at `/riyadh-tech/sources.json`.

Validate changes with `npm run test:news`, `npm run build`, and `npm run check:magazine`. The repository's older site-wide validator has pre-existing diagnostics unrelated to the magazine; use the magazine-specific checks and the matching Vercel deployment when validating this publisher.

## Magazine navigation

The magazine remains on the main domain under `/riyadh-tech/`. Its `news/`, `explainers/`, `tools/`, and `business/` routes list each section. `archive/` and section/source listings render 12 stories per page; later pages use `page/2/` paths and preserve existing article URLs. `sources/` links to seven source profiles; profiles without articles remain accessible with `noindex, follow`.

`search/` searches all published titles, summaries and tags, with combined section/source filters and chronological sorting. Query state is shareable through `q`, `category`, `source`, and `sort` URL parameters. `saved/` uses browser local storage without accounts; font preferences are also device-local. These two utility routes are excluded from the sitemap. `about/` explains attribution, automatic publishing, and corrections.

Run `npm run test:magazine`, `npm run build`, and `npm run check:magazine` for route, publisher, indexing, source-date, asset and link checks. New automatic-news entries are included in all appropriate section, source, search, archive and RSS views on every build without modifying routing files.

## Magazine visual system

The magazine uses seven locally rendered SVG illustration families in `src/riyadh-tech-art.mjs`, an editorial cover, responsive source cards, and a dedicated article reading layout. No third-party illustration requests or animation library are required. Motion starts only after enhancement, respects the operating system reduced-motion preference, pauses while the document is hidden, and can be disabled from the magazine navigation. The preference uses `riyadh-tech:motion:v1` in browser local storage; search, reading lists, typography and publisher behavior remain independent.

The reading-room edition adds a prismatic SVG cover, a four-section story selector, a wider lead card on large displays, and framed article posters. The selector starts with every story visible without JavaScript, then enhances to one selected story with accessible buttons and RTL arrow-key navigation; it never auto-advances. Article prose defaults to a paper palette with an optional dark palette, saved using `riyadh-tech:reader-theme:v1`. Storage failures leave the palette switch and reading tools usable for the current visit. These presentation changes do not alter source policies, publication timestamps, article URLs or the automatic-news archive.
