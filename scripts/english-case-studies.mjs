import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const buildDate = new Date().toISOString().slice(0, 10);

const cases = [
  {
    slug: "tawod",
    title: "Tawod General Contracting",
    category: "Contracting · Riyadh",
    summary: "An Arabic-first contracting platform connecting service architecture, local search and direct-response conversion paths in one scalable web system.",
    challenge: "A contracting website has to serve several decisions at once: explain a broad service portfolio, establish local relevance, help visitors find the right service quickly and make contact easy on mobile. A generic brochure structure would leave both users and search engines with weak context.",
    solution: "The platform was structured around service intent and location relevance. Service pages, city-oriented content, mobile-first calls to action, internal linking, metadata and structured data were designed as one system so future services and geographic pages can be added without rebuilding the information architecture.",
    decisions: [
      "Arabic-first information architecture aligned to contracting search intent.",
      "Clear call and WhatsApp paths placed near decision points rather than only in the footer.",
      "Reusable service and location patterns for future geographic expansion.",
      "Technical SEO foundations including canonical metadata, structured data and internal linking.",
    ],
    outcomes: [
      "A clearer relationship between services, locations and contact actions.",
      "A mobile journey that reduces unnecessary steps between intent and enquiry.",
      "A scalable publishing structure for additional cities, services and supporting content.",
    ],
    tags: ["Web Development", "Technical SEO", "Local SEO"],
    stack: "Web delivery · Structured data · Local SEO · Conversion UX",
    liveUrl: "https://tawodco.com/",
    liveLabel: "View live project",
    accent: "#24d8ff",
    serviceLinks: ["web-development", "seo", "google-business-profile"],
  },
  {
    slug: "ameen",
    title: "Ameen Maintenance Services",
    category: "Home Services · Riyadh",
    summary: "A fast mobile-first landing experience built around local intent, clear service messaging and short paths from search to call or WhatsApp.",
    challenge: "Local maintenance demand is often urgent and mobile. Visitors need to understand the service, confirm relevance and contact the provider without navigating a heavy website. Long copy, unclear hierarchy or hidden contact actions can introduce friction before the first conversation starts.",
    solution: "The experience was simplified into a focused local-service landing flow. Responsive layout, concise service blocks, visible direct-response actions and locally relevant content were used to keep the page understandable for both visitors and search systems without turning it into a keyword-stuffed page.",
    decisions: [
      "Mobile-first hierarchy designed around fast local-service decisions.",
      "Direct call and WhatsApp actions kept visible and contextually relevant.",
      "Service copy organized around user questions instead of generic company language.",
      "Lightweight page structure that remains easy to update and deploy.",
    ],
    outcomes: [
      "A shorter path from local search intent to direct contact.",
      "A clearer service proposition on small screens.",
      "A reusable landing-page base for future service or area variations.",
    ],
    tags: ["Landing Page", "Conversion UX", "Local Search"],
    stack: "Responsive UI · Local content · Direct-response UX",
    liveUrl: "https://ameenservse.vercel.app/",
    liveLabel: "View live project",
    accent: "#8b5cff",
    serviceLinks: ["web-development", "seo", "google-business-profile"],
  },
  {
    slug: "alargan-crm",
    title: "Alargan CRM — Agent-Led Proposal",
    category: "Real Estate CRM · Enterprise UX",
    summary: "A client-safe case study showing how a complex CRM proposal was reframed as an agent-led experience that explains the system, integrations and business value step by step.",
    challenge: "Complex enterprise proposals often become long feature inventories. The decision-maker has to mentally connect CRM modules, integrations, workflows and business outcomes while moving through a conventional presentation. That creates cognitive load and makes the strongest idea feel like another software list.",
    solution: "The proposal experience was restructured around an Agent-Led Proposal model. Instead of acting as decoration, the agent becomes the presenter: it introduces each scene, explains why the capability matters and guides the reader through the CRM story in a deliberate decision sequence. The public case intentionally omits confidential implementation details and private proposal content.",
    decisions: [
      "Replace the traditional hero-first proposal pattern with a presenter-led opening scene.",
      "Keep the agent present throughout the narrative rather than limiting it to the first screen.",
      "Translate technical architecture into a sequence of business decisions and operating outcomes.",
      "Separate the public case study from the private proposal route and confidential implementation details.",
    ],
    outcomes: [
      "A more distinctive enterprise proposal format than a standard feature deck.",
      "A clearer narrative connection between CRM capabilities and operating value.",
      "A reusable interaction model for other complex B2B technology proposals.",
    ],
    tags: ["AI UX", "CRM", "Interactive Proposal"],
    stack: "Agent-led UX · CRM storytelling · Enterprise presentation",
    liveUrl: null,
    liveLabel: null,
    accent: "#31e6b5",
    serviceLinks: ["ai-agents", "web-development", "knowledge-bases"],
  },
];

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const casePath = (item, language = "en") => language === "en" ? `/en/work/${item.slug}/` : `/work/${item.slug}/`;
const pairedAlternates = (item) => `<link rel="alternate" hreflang="ar" href="${site.url}${casePath(item, "ar")}"><link rel="alternate" hreflang="ar-SA" href="${site.url}${casePath(item, "ar")}"><link rel="alternate" hreflang="en" href="${site.url}${casePath(item)}"><link rel="alternate" hreflang="x-default" href="${site.url}${casePath(item, "ar")}">`;

function replaceAlternates(html, item) {
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, "");
  return html.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n  ${pairedAlternates(item)}`);
}

function setLanguageTarget(html, target) {
  return html.replace(/(<a class="language-link" href=")[^"]*("[^>]*>)/g, `$1${target}$2`);
}

function setActiveNavigation(html, activePath) {
  for (const className of ["desktop-nav", "mobile-menu"]) {
    const pattern = new RegExp(`(<nav class="${className}"[\\s\\S]*?<\\/nav>)`);
    html = html.replace(pattern, (nav) => {
      const clean = nav.replace(/ aria-current="page"/g, "");
      return clean.replace(`href="${activePath}"`, `href="${activePath}" aria-current="page"`);
    });
  }
  return html;
}

const organizationSchema = {
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.nameEn,
  alternateName: site.nameAr,
  url: site.url,
  logo: `${site.url}${site.logo}`,
  email: site.email,
  telephone: site.phone,
  address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
};

const websiteSchema = {
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: site.nameEn,
  inLanguage: ["ar-SA", "en"],
  publisher: { "@id": `${site.url}/#organization` },
};

function caseGraph(item) {
  const path = casePath(item);
  const canonical = `${site.url}${path}`;
  return [
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: `${item.title} Case Study | ${site.nameEn}`,
      description: item.summary,
      inLanguage: "en",
      isPartOf: { "@id": `${site.url}/#website` },
      mainEntity: { "@id": `${canonical}#case-study` },
      dateModified: buildDate,
    },
    {
      "@type": "CreativeWork",
      "@id": `${canonical}#case-study`,
      name: `${item.title} Case Study`,
      description: item.summary,
      url: canonical,
      creator: { "@id": `${site.url}/#organization` },
      keywords: item.tags.join(", "),
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en/` },
        { "@type": "ListItem", position: 2, name: "Work", item: `${site.url}/en/work/` },
        { "@type": "ListItem", position: 3, name: item.title, item: canonical },
      ],
    },
    organizationSchema,
    websiteSchema,
  ];
}

function indexGraph() {
  const canonical = `${site.url}/en/work/`;
  return [
    {
      "@type": "CollectionPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: `Selected Work & Digital Case Studies | ${site.nameEn}`,
      description: "Selected BOWDY LABS case studies across web platforms, local search, conversion UX and agent-led enterprise experiences.",
      inLanguage: "en",
      isPartOf: { "@id": `${site.url}/#website` },
      dateModified: buildDate,
    },
    {
      "@type": "ItemList",
      "@id": `${canonical}#case-studies`,
      name: "BOWDY LABS case studies",
      numberOfItems: cases.length,
      itemListElement: cases.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${site.url}${casePath(item)}`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en/` },
        { "@type": "ListItem", position: 2, name: "Work", item: canonical },
      ],
    },
    organizationSchema,
    websiteSchema,
  ];
}

function replaceSchema(html, graph) {
  const script = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script>`;
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, script);
}

function metadata(html, item) {
  const path = casePath(item);
  const canonical = `${site.url}${path}`;
  const title = `${item.title} Case Study | ${site.nameEn}`;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(item.summary)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="article">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(item.summary)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(title)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(item.summary)}">`);
  html = replaceAlternates(html, item);
  return replaceSchema(html, caseGraph(item));
}

function cards() {
  return `<div class="case-study-grid">${cases.map((item) => `<article class="case-study-card reveal" style="--case-accent:${item.accent}"><small>${esc(item.category)}</small><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p><div class="case-study-tags">${item.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div><a class="text-link" href="${casePath(item)}">Read case study <span aria-hidden="true">↗</span></a></article>`).join("")}</div>`;
}

function indexMain() {
  return `<main id="main"><section class="page-hero section-pad"><div class="container page-hero-grid"><div class="reveal"><span class="eyebrow"><i aria-hidden="true"></i>SELECTED WORK</span><h1>Case studies built around the problem, the system and the decision</h1><p>These public case studies explain what changed in the experience or architecture without inventing performance metrics or exposing private implementation details.</p></div><div class="page-hero-symbol reveal" aria-hidden="true"><span></span><img class="page-hero-logo" src="${site.logo}" width="72" height="72" alt=""></div></div></section><section class="section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>CASE STUDIES</span><h2>Three different problems. Three focused systems.</h2><p>From local-service conversion to technical SEO and enterprise proposal UX, each case is documented around constraints, design decisions and observable structural outcomes.</p></div>${cards()}</div></section><section class="cta-section section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>YOUR NEXT SYSTEM</span><h2>Have a similar problem?</h2><p>Share the current state, the outcome you need and the constraints we should respect. We will propose a focused starting point.</p></div><a class="button" href="/en/contact/">Discuss your project <span aria-hidden="true">↗</span></a></div></section></main>`;
}

function caseMain(item) {
  const live = item.liveUrl ? `<a class="button button-ghost" href="${item.liveUrl}" target="_blank" rel="noopener">${item.liveLabel} <span aria-hidden="true">↗</span></a>` : "";
  const decisions = item.decisions.map((decision, index) => `<article class="deliverable-card reveal"><div><span>${String(index + 1).padStart(2, "0")}</span><span>↗</span></div><h3>${esc(decision)}</h3></article>`).join("");
  const outcomes = item.outcomes.map((outcome) => `<p><span>✓</span><span>${esc(outcome)}</span></p>`).join("");
  const related = item.serviceLinks.map((slug) => `<a class="text-link" href="/en/services/${slug}/">${esc(slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "))} ↗</a>`).join("");
  return `<main id="main"><nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/en/">Home</a></li><li><a href="/en/work/">Work</a></li><li><span aria-current="page">${esc(item.title)}</span></li></ol></nav><section class="case-hero"><div class="container case-hero-grid"><div class="reveal"><span class="case-kicker">CASE STUDY · ${esc(item.category)}</span><h1>${esc(item.title)}</h1><p>${esc(item.summary)}</p><div class="hero-actions"><a class="button" href="/en/contact/">Discuss a similar project</a>${live}</div></div><aside class="case-summary reveal"><article><small>Context</small><strong>${esc(item.category)}</strong></article><article><small>Capabilities</small><strong>${esc(item.tags.join(" · "))}</strong></article><article><small>System</small><strong>${esc(item.stack)}</strong></article></aside></div></section><section class="section-pad"><div class="container case-story"><article class="case-panel reveal"><span>01 · CHALLENGE</span><h2>The problem before the interface</h2><p>${esc(item.challenge)}</p></article><article class="case-panel reveal"><span>02 · SOLUTION</span><h2>What we changed and why</h2><p>${esc(item.solution)}</p></article></div></section><section class="section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>KEY DECISIONS</span><h2>Architecture and experience decisions that shaped the result</h2><p>The case focuses on design and engineering choices we can verify directly rather than claiming unsupported commercial uplift.</p></div><div class="deliverables-grid">${decisions}</div></div></section><section class="section-pad"><div class="container detail-grid"><div class="detail-block reveal"><span class="eyebrow"><i aria-hidden="true"></i>OBSERVABLE OUTCOMES</span><h2>What became structurally clearer</h2><div class="outcome-list">${outcomes}</div><p class="case-evidence-note">These are structural and experience outcomes visible in the delivered system. No numerical conversion or revenue claim is made without verified measurement evidence.</p></div><aside class="scope-card reveal"><small>RELATED</small><h2>BOWDY LABS capabilities used in this type of work</h2>${related}</aside></div></section><section class="cta-section section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>START FROM THE PROBLEM</span><h2>Build a system around your actual decision flow</h2><p>Share the current experience, the bottleneck and the outcome you need. We will identify the smallest useful starting point.</p></div><a class="button" href="/en/contact/">Discuss your project <span aria-hidden="true">↗</span></a></div></section></main>`;
}

let shell = await readFile(join(dist, "en", "about", "index.html"), "utf8");

let workIndex = await readFile(join(dist, "en", "work", "index.html"), "utf8");
workIndex = workIndex.replace(/<main id="main">[\s\S]*?<\/main>/, indexMain());
workIndex = replaceSchema(workIndex, indexGraph());
workIndex = setActiveNavigation(workIndex, "/en/work/");
await writeFile(join(dist, "en", "work", "index.html"), workIndex, "utf8");

for (const item of cases) {
  const destination = join(dist, "en", "work", item.slug, "index.html");
  await mkdir(dirname(destination), { recursive: true });
  let html = metadata(shell, item);
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, caseMain(item));
  html = setLanguageTarget(html, casePath(item, "ar"));
  html = setActiveNavigation(html, "/en/work/");
  await writeFile(destination, html, "utf8");

  const arabicPath = join(dist, "work", item.slug, "index.html");
  let arabic = await readFile(arabicPath, "utf8");
  arabic = replaceAlternates(arabic, item);
  arabic = setLanguageTarget(arabic, casePath(item));
  await writeFile(arabicPath, arabic, "utf8");
}

let sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
for (const item of cases) {
  const url = `${site.url}${casePath(item)}`;
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  sitemap = sitemap.replace(new RegExp(`\\s*<url><loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, "g"), "");
}
const sitemapEntries = cases.map((item) => `  <url><loc>${site.url}${casePath(item)}</loc><lastmod>${buildDate}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join("\n");
sitemap = sitemap.replace("</urlset>", `${sitemapEntries}\n</urlset>`);
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");

const llmsPath = join(dist, "llms.txt");
let llms = await readFile(llmsPath, "utf8");
for (const item of cases) {
  const route = `${site.url}${casePath(item)}`;
  if (!llms.includes(route)) llms += `\n- ${route}`;
}
await writeFile(llmsPath, `${llms.trim()}\n`, "utf8");

for (const item of cases) {
  const path = casePath(item);
  const output = await readFile(join(dist, "en", "work", item.slug, "index.html"), "utf8");
  if (!output.includes(`<link rel="canonical" href="${site.url}${path}">`)) throw new Error(`Canonical missing for ${path}`);
  if (!output.includes(`hreflang="ar-SA" href="${site.url}${casePath(item, "ar")}"`)) throw new Error(`Arabic hreflang missing for ${path}`);
  if (!output.includes(`hreflang="en" href="${site.url}${path}"`)) throw new Error(`English hreflang missing for ${path}`);
  if (!output.includes('"@type":"CreativeWork"')) throw new Error(`CreativeWork schema missing for ${path}`);
  if (!output.includes(`href="/en/services/`)) throw new Error(`Related English service links missing for ${path}`);
  if (output.includes("/alarjancrm/")) throw new Error(`Private Alargan route leaked into ${path}`);
  if (!sitemap.includes(`${site.url}${path}`)) throw new Error(`Sitemap missing ${path}`);
}

const indexOutput = await readFile(join(dist, "en", "work", "index.html"), "utf8");
for (const item of cases) {
  if (!indexOutput.includes(`href="${casePath(item)}"`)) throw new Error(`English work index missing ${casePath(item)}`);
}

console.log(`Generated ${cases.length} English case studies with reciprocal localization and public-safe content.`);
