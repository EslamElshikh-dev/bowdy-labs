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

## Commands

- `npm run build` — generate the static site into `dist/`
- `npm run validate` — validate metadata, schema, internal links, responsive assets, and the sitemap
- `npm run smoke` — serve `dist/` temporarily and check important routes
- `npm run check` — run syntax checks, build, validation, and smoke tests
- `npm run serve` — preview `dist/` on port 4173

## Source structure

- `src/content.mjs` — brand, services, work, insights, and contact data
- `src/agents.mjs` — bilingual agent roles, tasks, outcomes, and voice
- `src/agents-page.mjs` — Arabic and English agent showcase templates and structured data
- `build.mjs` — static page templates, structured data, and SEO files
- `assets/css/main.css` — responsive visual system
- `assets/js/main.js` — navigation, filters, reveals, accordion, and project brief
- `assets/brand/` — vector brand mark
- `assets/media/` — hero artwork and responsive agent portraits
- `assets/og/` — social sharing artwork

## Deployment

Vercel runs `npm run build`, serves the generated `dist/` directory, and publishes production from the `main` branch at https://bowdy-labs.vercel.app.
