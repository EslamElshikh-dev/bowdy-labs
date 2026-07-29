# BOWDY LABS

Arabic-first corporate website for BOWDY LABS, a Riyadh-based technology and artificial intelligence company.

## Experience

- Futuristic dark interface with a circuit-board B mark and AI hero artwork
- Arabic and English home experiences
- Nine connected service capabilities
- Work, insights, about, contact, privacy, and terms pages
- Responsive navigation and mobile bottom bar
- Organization, ProfessionalService, Service, FAQ, Article, and WebPage structured data
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
- `build.mjs` — static page templates, structured data, and SEO files
- `assets/css/main.css` — responsive visual system
- `assets/js/main.js` — navigation, filters, reveals, accordion, and project brief
- `assets/brand/` — vector brand mark
- `assets/media/` — hero artwork
- `assets/og/` — social sharing artwork

Vercel runs `npm run build` and serves the generated `dist/` directory.
