# Independent business-system services

The service hub and four new services are generated in Arabic and English:

- /services/crm-development/
- /services/business-dashboards/
- /services/booking-systems/
- /services/ai-chatbots/

Each has a reciprocal /en/ page. The approved homepage gains a scoped discovery
section; its original hero, layout, governance section and pricing removal remain.

## Sources and build

src/business-systems-content.mjs owns bilingual service, FAQ and planning copy.
src/business-systems-page.mjs renders the UI. scripts/business-systems.mjs runs
after the existing commercial pass and before performance/assistant finalization.
It creates the pages, Service/FAQ/Breadcrumb data, reciprocal alternates, sitemap
entries, contact options, and the privacy disclosure. The llms source is maintained
in scripts/page-speed-hardening.mjs.

## Examples and request handoff

These are synthetic, browser-local demonstrations, not provisioned business
systems. They make no network calls and perform no model inference. The chatbot
uses preset responses and is explicitly labelled. Simulated roles do not provide
real authorization; production access controls require backend enforcement.

The shared model in assets/js/business-systems-model.js controls enquiry
ownership, duplicate handling, booking conflicts/rescheduling, simulated approval,
and allowlisted planning choices. The UI controller is
assets/js/business-systems.js.

The planner downloads a local UTF-8 text brief or carries only known service,
tool and approval identifiers to the contact page. Its brief is editable before
the visitor prepares and sends their own WhatsApp message. Interaction analytics
contain predefined categories, not names, contact data, or brief text.

When changing these immutable assets, bump both page resource queries and the
controller's model import query.

## Validation

npm run check covers unit state transitions, bilingual routes and schema,
the 13-service visible catalogue, sitemap/llms discovery, pricing removal and the
existing regression suite. The change adds state-transition and generated-page
checks. Browser QA also exercises CRM duplicate handling, booking confirmation
and rescheduling, manager approval, stale-data display, chatbot escalation and
the scoped contact handoff.

Responsive review uses local-only srcdoc fixtures outside this repository and
production output. Never publish QA fixture routes. Test small screens and both
languages before changing the shared layout.
