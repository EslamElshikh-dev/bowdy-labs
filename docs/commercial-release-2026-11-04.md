# Commercial journey — 4 November 2026

The home page now leads with one business outcome: a secure AI agent assigned to a clear job. The bilingual pricing journey publishes the owner's approved core prices and cancellation terms. Other capabilities support that journey through distinct service copy.

## Published scope

- Arabic and English home, pricing and service overview pages.
- Four featured agents, three plan summaries, three home FAQs and six pricing FAQs.
- Pricing navigation, reciprocal alternates, canonicals, sitemap entries, Service/Offer price components, FAQPage and breadcrumbs.
- VAT-inclusive core prices: Launch SAR 1,500 setup + 690/month; Build from SAR 7,500 with optional operations at 990/month; Scale quoted, typically from SAR 30,000 for its first phase.
- Clear usage limits and exclusions. A typical Build range is descriptive, not a hard price cap. Custom and enterprise scopes do not silently include every agent or unlimited integrations.
- Trial intake uses four fields, validates phone numbers including Arabic digits, and prepares a WhatsApp message for the visitor to review and send. It does not create a CRM record or confirm message delivery.
- `pricing_view` measures page load. `trial_request` measures a validated `whatsapp_handoff`, not a received lead. Neither event contains name, phone, WhatsApp number or task text. Closed-loop lead receipt needs a separate messaging/CRM integration.
- Privacy and terms explain the actual form handoff, assistant processing, session lifetime and project-specific data handling. Client trial retention periods must be agreed before real data is used.
- Technology labels appear on About; no invented client counts, Maroof number, testimonials or AI performance results are published.
- The footer continues without a personal developer badge, in accordance with DEVELOPMENT.md.

## Readiness decisions

The inspected Vercel project `bowdy-labs` has no configured environment variables. `/api/bowdy` uses Cloudflare Workers AI when configured through `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_AI_TOKEN` (or existing supported aliases). No new credentials were obtained or billed services provisioned in this release.

Until model connectivity, trial fulfilment, rate/cost limits and the complete customer flow are tested, the call to action requests a free trial with timing confirmed after assessment. A 24-hour fulfilment promise is deliberately absent. Adding a key alone is not sufficient evidence for that promise.

Saudi hosting is scoped per engagement and must cover both storage and model processing where required. Readiness for NCA and PDPL is not regulator certification or guaranteed compliance. Add-on prices in the draft were not approved, so they remain quote-only. The Maroof number and verified case results still need owner-supplied evidence.

## Validation

`npm run check` runs syntax checks, 47 existing editorial tests, the full build, 10 commercial journey tests, public/private route validation, magazine checks and HTTP smoke tests including both pricing routes. `npm audit --audit-level=high` reported no vulnerabilities in the installed lockfile.

Commercial tests verify recurring versus setup charges, optional operations, visible/schema consistency, reciprocal routes, scoped catalog entries, safe trial handoff, Arabic phone normalisation, invalid input, popup fallback and analytics privacy. Browser review covers desktop home/pricing, the trial entry point and a 390px iframe viewport for mobile layout. Deployment and Search Console outcomes must be checked separately after merge.

## Build order

`scripts/commercial-rollout.mjs` runs after legacy content passes and before performance and final credit passes. The commercial content is kept in `src/commercial-content.mjs` and the markup/schema in `src/commercial-pages.mjs`. This final content pass prevents older home-page and English-depth scripts from restoring the previous nine-service layout.

## Reference checks

- [NCA essential controls and applicability](https://nca.gov.sa/en/regulatory-documents/controls-list/ecc/)
- [SDAIA law and regulations](https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx)
- [Compound price specifications](https://schema.org/CompoundPriceSpecification)
- [Unit price specifications](https://schema.org/UnitPriceSpecification)
- [Google Search documentation updates](https://developers.google.com/search/updates): the FAQ rich-result feature was removed from Search in May 2026. FAQPage is descriptive markup, not an eligibility or display promise.
