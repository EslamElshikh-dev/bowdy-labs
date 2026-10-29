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

Use Node.js 24 and run `npm ci --include=dev` before building or checking a fresh checkout. The committed `package-lock.json` pins the build tools, including Terser and Sharp.

- `npm run build` — generate the static site into `dist/`
- `npm run check:news` — validate the source registry and complete news archive without installing build dependencies or generating pages
- `npm run check:news -- --file /path/to/candidate.json` — validate a proposed complete archive before committing it
- `npm run validate` — validate metadata, schema, internal links, responsive assets, and the sitemap
- `npm run smoke` — serve `dist/` temporarily and check important routes
- `npm run check` — run syntax checks, build, validation, and smoke tests
- `npm run check:magazine` — validate the built magazine's routes, metadata, dates, sources, RSS, social cards, and internal links
- `npm run serve` — preview `dist/` on port 4173

`Site quality checks` starts with the dependency-free `News data validation` job: source-registry and archive validation, plus validator and npm lifecycle regression tests. Only after that succeeds may `validate-site` install the locked dependencies, audit them, and run the full `npm run check` chain. The full check runs news validation and tests before building. The workflow runs on every pull request targeting `main`, every push to `main`, merge-queue groups, and manual runs; required checks are not hidden behind path filters. The Node.js 24 actions are pinned to their verified release commits, and checkout does not persist credentials. The npm download cache is keyed by `package-lock.json`; dependencies are installed on every run, including cache hits. Dependency vulnerabilities at high or critical severity, build, magazine, SEO, and smoke failures fail the job.

## Source structure

- `src/content.mjs` — brand, services, work, insights, and contact data
- `src/agents.mjs` — bilingual agent roles, tasks, outcomes, and voice
- `src/agents-page.mjs` — Arabic and English agent showcase templates and structured data
- `src/riyadh-tech-content.mjs` — magazine identity and editorial content; add or update stories here, preserving source dates separately from magazine publication dates
- `src/riyadh-tech-page.mjs` — magazine index, article templates, NewsArticle/BlogPosting schema, and RSS
- `src/riyadh-tech-images.mjs` — locally rendered social cards for the magazine and its stories
- `src/data/riyadh-tech-sources.json` — seven approved official sources, RSS/newsroom fallbacks, hourly cadence, a seven-day recovery window, and an eight-story per-run batch
- `src/data/riyadh-tech-news.json` — append-only input for automatic news publication; the scheduled publisher proposes changes to this file through a pull request
- `src/riyadh-tech-news-validation.mjs` — shared, dependency-free source-registry and publication validators; checks dates, source domains, canonical URL duplicates, Arabic summaries, and trusted Hugging Face authors
- `scripts/validate-news.mjs` — read-only preflight for the checked-in archive or a candidate JSON file, with actionable article-index and source-ID errors
- `src/riyadh-tech-news.mjs` — loads validated news, creates stable article URLs and author attribution, and re-exports the shared validators for existing consumers
- `build.mjs` — static page templates, structured data, and SEO files
- `assets/css/main.css` — responsive visual system
- `assets/js/main.js` — navigation, filters, reveals, accordion, and project brief
- `assets/brand/` — vector brand mark
- `assets/media/` — hero artwork and responsive agent portraits
- `assets/og/` — social sharing artwork

## Deployment

Vercel runs `npm run build`, serves the generated `dist/` directory, and publishes production from the `main` branch at https://bowdylabs.com.

The npm `prebuild` lifecycle runs the same news preflight before any rendering, including on Vercel. This is a final content guard; it cannot make a push to an unprotected branch wait for GitHub Actions. GitHub and Vercel start independently for Git pushes. Protecting `main` and publishing via checked pull requests is what keeps invalid content out of production build attempts.

### Required repository settings

These are account settings and are **not enabled by committing this README or the workflow**. At the 29 October 2026 audit, GitHub reported `main` as unprotected and the repository ruleset list was empty. The connected GitHub App cannot read or modify administration-only branch-protection settings (`403 Resource not accessible by integration`). Confirm and apply the following through an authorized administrator:

- Target only `main`; require a pull request before merging, including for automatic publication. A human approval is optional for this unattended publisher; passing checks are mandatory.
- Require both `News data validation` and `validate-site`, supplied by the GitHub Actions app. Keep the branch up to date before merging, or use a merge queue (the workflow supports `merge_group`).
- Apply the rule to administrators too, with no publisher bypass; block force pushes and deletion. Do not require the Vercel production status before merging: that production deployment starts after the merge.
- Test the rule with a content-only pull request: failed news validation must block merging, and only the exact tested head may merge. Never use a direct push or a bypass to recover a failed content check.

Vercel Deployment Checks can additionally hold production-domain assignment until external checks pass. They run around a deployment that Vercel has already started, so they complement the pull-request gate rather than replacing it when the goal is to avoid invalid-content production builds.

## Automatic magazine publication

The hourly ChatGPT automation reads the approved source registry and existing news from GitHub, checks RSS or the official newsroom, opens each original announcement, and adds new Arabic summaries to a candidate `src/data/riyadh-tech-news.json`. It changes only this data file on a publication branch and opens a pull request to `main`. Publication is performed through the connected GitHub/Vercel accounts and does not require a new model API key or a public write endpoint.

Read `sourceId` directly from the matching entry in `src/data/riyadh-tech-sources.json`; this registry is the sole source-ID list. Do not derive an ID from a display name, silently add an alias, or guess an ID from a hostname. For example, Google AI uses `google-ai`; `google` must fail validation. The preflight validates the registry itself too, including duplicate IDs, approved domains, source paths, and illustration metadata. Build-time consumers use the same validated registry and validator.

Each record contains `sourceId`, `sourceUrl`, `sourceTitle`, `eventDate` (the original announcement date), `publishedAt` (the actual magazine publication timestamp with timezone), `title`, `excerpt`, and `paragraphs` (one to three paragraphs, at most 140 words total). Preserve existing records and publication times. Never substitute the time of discovery for the source date.

Before committing a candidate archive, run `npm run check:news -- --file /path/to/candidate.json`; it reads the file without writing to the archive or `dist/` and exits nonzero on invalid JSON, unknown sources, invalid dates, incomplete fields, duplicates, or policy violations. Run `npm run check` on the proposed branch. A failure should be fixed on that branch, before merging, not repaired by following an invalid commit on `main`.

Immediately before preparing the branch, re-read the current `main` archive and its content SHA, preserve every existing record, and incorporate concurrent additions. Use the branch file's current SHA for writes. If `main` advances, update the candidate from the latest archive and repeat validation and CI. Merge only when both required checks succeeded for the exact current PR head and the branch is up to date; never bypass a failed or pending check. Reuse an existing publication PR when appropriate instead of creating competing batches. When local execution is unavailable, the PR's dependency-free preflight and complete site check still must succeed before any merge; never replace those results with a visual inspection of JSON.

Automatic briefs are visibly labeled and identify the automatic desk as author. NewsArticle metadata, RSS timestamps, sitemap entries, related articles, search and source-specific social cards update during the normal build. Social-image generation is bounded to the editorial set plus the approved sources, rather than regenerating an image for every archived news item. The source list is also visible within the magazine and at `/riyadh-tech/sources.json`.

After merging, verify the production deployment for the merged SHA reaches `READY`, then check the new article routes and RSS on the canonical domain. A successful Vercel deployment and a successful GitHub Actions check are separate results. Keep failed candidates on their branch and report the specific blocker if checks or access cannot be completed.

## Magazine navigation

The magazine remains on the main domain under `/riyadh-tech/`. Its `news/`, `explainers/`, `tools/`, and `business/` routes list each section. `archive/` and section/source listings render 12 stories per page; later pages use `page/2/` paths and preserve existing article URLs. `sources/` links to seven source profiles; profiles without articles remain accessible with `noindex, follow`.

`search/` searches all published titles, summaries and tags, with combined section/source filters and chronological sorting. Query state is shareable through `q`, `category`, `source`, and `sort` URL parameters. `saved/` uses browser local storage without accounts; font preferences are also device-local. These two utility routes are excluded from the sitemap. `about/` explains attribution, automatic publishing, and corrections.

Run `npm run test:magazine`, `npm run build`, and `npm run check:magazine` for route, publisher, indexing, source-date, asset and link checks. New automatic-news entries are included in all appropriate section, source, search, archive and RSS views on every build without modifying routing files.

## Magazine visual system

The magazine uses seven locally rendered SVG illustration families in `src/riyadh-tech-art.mjs`, an editorial cover, responsive source cards, and a dedicated article reading layout. No third-party illustration requests or animation library are required. Motion starts only after enhancement, respects the operating system reduced-motion preference, pauses while the document is hidden, and can be disabled from the magazine navigation. The preference uses `riyadh-tech:motion:v1` in browser local storage; search, reading lists, typography and publisher behavior remain independent.

The reading-room edition adds a prismatic SVG cover, a four-section story selector, a wider lead card on large displays, and framed article posters. The selector starts with every story visible without JavaScript, then enhances to one selected story with accessible buttons and RTL arrow-key navigation; it never auto-advances. Article prose defaults to a paper palette with an optional dark palette, saved using `riyadh-tech:reader-theme:v1`. Storage failures leave the palette switch and reading tools usable for the current visit. These presentation changes do not alter source policies, publication timestamps, article URLs or the automatic-news archive.
