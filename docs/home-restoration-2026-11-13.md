# Homepage restoration and pricing removal — 13 November 2026

The Arabic and English homepages use the original rendering pipeline and layout from immediately before PR #56 (`92801e1de9324dee8d3ae9cfa952d7ca4087d2d0`). The commercial pass no longer replaces the home with the agent/pricing landing page. The original hero artwork, navigation proportions, capabilities, work, methodology and calls to action are restored. The visible personal footer signature remains omitted.

Governance is retained in both languages using the original homepage styles: scoped permissions, human approval, reviewable logs, processing locations, retention/deletion, and project-specific NCA/PDPL readiness. Existing privacy disclosures, trial intake, external WhatsApp handoff and readiness caveats remain. Readiness is not described as certification, and Saudi-only processing is not promised for the public site. Existing commercial service descriptions remain available.

Published plan definitions, price cards, comparison tables, pricing FAQ/metadata, monetary schema, budget ranges and assistant price replies are removed. No pricing pages are generated or linked from navigation, sitemap or llms.txt. `/pricing` and `/en/pricing` permanently redirect to the respective contact pages. Payment/cancellation terms now refer to the written project agreement rather than discontinued plans. Old plan query parameters have no effect on trial messages or analytics. Updated immutable asset versions prevent cached scripts from continuing to display old prices.

Validation:

- Compared the generated main content in both languages with a build of the historical reference: exact match after excluding the retained governance section.
- `npm run check`: passed; 47 magazine tests plus 9 commercial journey/regression tests, structured data and internal-link validation for 354 public HTML pages, private-route checks and HTTP smoke checks. Final metadata changes were followed by build, commercial tests, validation and smoke checks again.
- Browser QA: original desktop hero, governance and homepage rendering at iframe viewport widths 320, 390, 768 and 1280 pixels in Arabic and English. No horizontal overflow at any tested width; no pricing links. These are browser viewport checks, not physical-device testing.
- The validator reports 17 pre-existing long-title warnings on magazine news pages; none concerns this change. Magazine content is not rolled back.
- Vercel redirect behavior requires production verification after deployment; the local static server verifies the old pricing files are absent (404).
