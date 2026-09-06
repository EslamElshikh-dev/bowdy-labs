import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { services, site } from "../src/content.mjs";
import { englishInsightDepth, englishServiceDepth } from "../src/english-depth-content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const buildDate = new Date().toISOString().slice(0, 10);

const groups = {
  "الأمن والبنية السحابية": "Security & Cloud",
  "الذكاء الاصطناعي والبرمجيات": "AI & Software",
  "منظومة Google": "Google Ecosystem",
  "النمو والبحث الذكي": "Growth & Intelligent Search",
};

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const pairedAlternates = (en, ar) => `<link rel="alternate" hreflang="ar" href="${site.url}${ar}"><link rel="alternate" hreflang="ar-SA" href="${site.url}${ar}"><link rel="alternate" hreflang="en" href="${site.url}${en}"><link rel="alternate" hreflang="x-default" href="${site.url}${ar}">`;

function replaceAlternates(html, en, ar) {
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, "");
  return html.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n  ${pairedAlternates(en, ar)}`);
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

function replaceSchema(html, graph) {
  const script = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script>`;
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, script);
}

function applyMetadata(html, { title, description, en, ar, type = "website", graph }) {
  const canonical = `${site.url}${en}`;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${type}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(title)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);
  html = replaceAlternates(html, en, ar);
  return replaceSchema(html, graph);
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

function serviceGraph(service, depth) {
  const en = `/en/services/${service.slug}/`;
  const canonical = `${site.url}${en}`;
  const title = `${depth.seoTitle} | ${site.nameEn}`;
  const serviceId = `${canonical}#service`;
  return [
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: title,
      description: depth.description,
      inLanguage: "en",
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": serviceId },
      mainEntity: { "@id": serviceId },
      dateModified: buildDate,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en/` },
        { "@type": "ListItem", position: 2, name: "Services", item: `${site.url}/en/services/` },
        { "@type": "ListItem", position: 3, name: service.titleEn, item: canonical },
      ],
    },
    {
      "@type": "Service",
      "@id": serviceId,
      name: service.titleEn,
      alternateName: service.title,
      serviceType: service.titleEn,
      description: depth.description,
      url: canonical,
      provider: { "@id": `${site.url}/#organization` },
      areaServed: { "@type": "Country", name: "Saudi Arabia" },
    },
    {
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
      mainEntity: depth.faq.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
    organizationSchema,
    websiteSchema,
  ];
}

function articleGraph(item) {
  const en = `/en/insights/${item.slug}/`;
  const canonical = `${site.url}${en}`;
  const articleId = `${canonical}#article`;
  const title = `${item.title} | ${site.nameEn}`;
  return [
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: title,
      description: item.description,
      inLanguage: "en",
      isPartOf: { "@id": `${site.url}/#website` },
      mainEntity: { "@id": articleId },
      dateModified: buildDate,
    },
    {
      "@type": "Article",
      "@id": articleId,
      headline: item.title,
      description: item.description,
      url: canonical,
      mainEntityOfPage: { "@id": `${canonical}#webpage` },
      inLanguage: "en",
      author: { "@id": `${site.url}/#organization` },
      publisher: { "@id": `${site.url}/#organization` },
      image: `${site.url}${site.shareImage}`,
      dateModified: buildDate,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en/` },
        { "@type": "ListItem", position: 2, name: "Insights", item: `${site.url}/en/insights/` },
        { "@type": "ListItem", position: 3, name: item.title, item: canonical },
      ],
    },
    organizationSchema,
    websiteSchema,
  ];
}

const breadcrumbs = (items) => `<nav class="breadcrumbs container" aria-label="Breadcrumb"><ol>${items.map(([label, href], index) => `<li>${href && index < items.length - 1 ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}</li>`).join("")}</ol></nav>`;

const hero = (kicker, title, description, actions = "") => `<section class="page-hero section-pad"><div class="container page-hero-grid"><div class="reveal"><span class="eyebrow"><i aria-hidden="true"></i>${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p>${actions}</div><div class="page-hero-symbol reveal" aria-hidden="true"><span></span><img class="page-hero-logo" src="${site.logo}" width="72" height="72" alt=""></div></div></section>`;

const cta = (title, description, service = "") => `<section class="cta-section section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>START WITH THE OUTCOME</span><h2>${esc(title)}</h2><p>${esc(description)}</p></div><a class="button" href="/en/contact/${service ? `?service=${service}` : ""}">Discuss your project <span aria-hidden="true">↗</span></a></div></section>`;

function relatedServices(current) {
  return [
    ...services.filter((candidate) => candidate.slug !== current.slug && candidate.group === current.group),
    ...services.filter((candidate) => candidate.slug !== current.slug && candidate.group !== current.group),
  ].slice(0, 3);
}

function serviceMain(service, depth) {
  const en = `/en/services/${service.slug}/`;
  const related = relatedServices(service);
  return `${breadcrumbs([["Home", "/en/"], ["Services", "/en/services/"], [service.titleEn, en]])}
  ${hero(groups[service.group] || "CAPABILITY", service.titleEn, depth.intro, `<div class="hero-actions"><a class="button" href="/en/contact/?service=${service.slug}">Discuss this capability ↗</a><a class="button button-ghost" href="/en/services/">All services</a></div>`)}
  <section class="section-pad service-overview-section"><div class="container service-overview-grid">
    <article class="service-overview-copy reveal"><span class="eyebrow"><i aria-hidden="true"></i>UNDERSTAND THE CAPABILITY</span><h2>Start with context. Finish with an operating result.</h2>${depth.overview.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</article>
    <aside class="ideal-card reveal"><small>WHEN IT FITS</small><h2>Teams that benefit from this capability</h2><ul>${depth.idealFor.map((item) => `<li><span>✓</span><span>${esc(item)}</span></li>`).join("")}</ul></aside>
  </div></section>
  <section class="section-pad challenges-section"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>PROBLEM BEFORE TOOL</span><h2>Challenges this capability is designed to address</h2><p>We connect each issue to user impact, operating risk or commercial cost before deciding what should change now and what can wait.</p></div><div class="challenge-grid">${depth.challenges.map(([title, text], index) => `<article class="challenge-card reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join("")}</div></div></section>
  <section class="section-pad service-detail"><div class="container detail-grid">
    <div class="detail-block reveal"><span class="eyebrow"><i aria-hidden="true"></i>OUTCOMES</span><h2>What should be different after the work?</h2><div class="outcome-list">${depth.outcomes.map((outcome) => `<p><span>✓</span><span>${esc(outcome)}</span></p>`).join("")}</div></div>
    <div class="scope-card reveal"><small>${service.number}</small><h2>Scope that can be tailored</h2>${depth.scope.map((item) => `<p>${esc(item)}</p>`).join("")}</div>
  </div></section>
  <section class="section-pad deliverables-section"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>DELIVERABLES</span><h2>What you receive at the end of the engagement</h2><p>Exact detail depends on scope, but deliverables remain reviewable, usable and tied to a decision or operating need.</p></div><div class="deliverables-grid">${depth.deliverables.map(([title, text], index) => `<article class="deliverable-card reveal"><div><span>${String(index + 1).padStart(2, "0")}</span><span>↗</span></div><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join("")}</div></div></section>
  <section class="section-pad process-section"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>DELIVERY METHOD</span><h2>Four stages from diagnosis to improvement</h2><p>Each stage has a purpose and review point so the project does not advance on impressions alone.</p></div><ol class="process-grid process-grid-detailed">${depth.steps.map((step, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(step)}</h3><p>${esc(depth.processDetails[index])}</p></li>`).join("")}</ol></div></section>
  <section class="section-pad related-services-section"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>RELATED CAPABILITIES</span><h2>Some outcomes require more than one layer</h2><p>Related work is recommended only when it materially affects the outcome and can remain a later phase when it is not necessary now.</p></div><div class="services-grid related-services-grid">${related.map((candidate) => `<article class="service-card reveal"><div class="service-top"><span>${candidate.number}</span></div><small>${groups[candidate.group] || "Technology"}</small><h3><a href="/en/services/${candidate.slug}/">${esc(candidate.titleEn)}</a></h3><p>${esc(candidate.shortEn)}</p><a class="text-link" href="/en/services/${candidate.slug}/">Explore capability ↗</a></article>`).join("")}</div></div></section>
  <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal"><span class="eyebrow"><i aria-hidden="true"></i>BEFORE WE START</span><h2>Frequently asked questions</h2><p>These answers clarify boundaries and delivery principles. Final scope follows review of the system, goal, data and constraints.</p><a class="button button-ghost" href="/en/contact/?service=${service.slug}">Share your case</a></div><div class="accordion">${depth.faq.map(([question, answer]) => `<details class="reveal"><summary>${esc(question)}<span>+</span></summary><p>${esc(answer)}</p></details>`).join("")}</div></div></section>
  ${cta(`Start a ${service.titleEn} project`, "Share the current state, target outcome and expected timeline without sending sensitive information.", service.slug)}`;
}

function insightMain(item) {
  const related = services.find((service) => service.slug === item.relatedService);
  const en = `/en/insights/${item.slug}/`;
  return `${breadcrumbs([["Home", "/en/"], ["Insights", "/en/insights/"], [item.title, en]])}
  ${hero(item.category, item.title, item.intro, `<div class="hero-actions"><a class="button" href="/en/contact/${related ? `?service=${related.slug}` : ""}">Discuss the use case ↗</a><a class="button button-ghost" href="/en/insights/">All insights</a></div>`)}
  <article class="article section-pad"><div class="container article-body"><div class="article-meta"><span>${esc(item.category)}</span><span>${esc(item.readTime)}</span></div>${item.sections.map(([heading, text], index) => `<section class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h2>${esc(heading)}</h2><p>${esc(text)}</p></section>`).join("")}<section class="reveal"><span>✓</span><h2>Practical checklist</h2><div class="outcome-list">${item.checklist.map((check) => `<p><span>✓</span><span>${esc(check)}</span></p>`).join("")}</div></section>${related ? `<section class="article-note reveal"><h2>Related BOWDY LABS capability</h2><p>${esc(related.shortEn)}</p><a class="text-link" href="/en/services/${related.slug}/">Explore ${esc(related.titleEn)} ↗</a></section>` : ""}</div></article>
  <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal"><span class="eyebrow"><i aria-hidden="true"></i>QUICK QUESTIONS</span><h2>Before applying the framework</h2><p>Use these answers as boundaries, then adapt the framework to the actual system and risk level.</p></div><div class="accordion">${item.faq.map(([question, answer]) => `<details class="reveal"><summary>${esc(question)}<span>+</span></summary><p>${esc(answer)}</p></details>`).join("")}</div></div></section>
  ${cta("Turn the framework into an implementation plan", "Bring the use case, constraints and current architecture. We can map a focused next step.", related?.slug || "")}`;
}

async function writePage(relativePath, html) {
  const destination = join(dist, ...relativePath.split("/").filter(Boolean), "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html, "utf8");
}

async function walkHtml(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkHtml(path));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

let shell = await readFile(join(dist, "en", "about", "index.html"), "utf8");

for (const service of services) {
  const depth = englishServiceDepth[service.slug];
  if (!depth) throw new Error(`Missing English depth content for service: ${service.slug}`);
  const en = `/en/services/${service.slug}/`;
  const ar = `/services/${service.slug}/`;
  let html = shell;
  html = applyMetadata(html, {
    title: `${depth.seoTitle} | ${site.nameEn}`,
    description: depth.description,
    en,
    ar,
    graph: serviceGraph(service, depth),
  });
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${serviceMain(service, depth)}</main>`);
  html = setLanguageTarget(html, ar);
  html = setActiveNavigation(html, "/en/services/");
  await writePage(en, html);

  const arabicPath = join(dist, "services", service.slug, "index.html");
  let arabic = await readFile(arabicPath, "utf8");
  arabic = replaceAlternates(arabic, en, ar);
  arabic = setLanguageTarget(arabic, en);
  await writeFile(arabicPath, arabic, "utf8");
}

for (const item of englishInsightDepth) {
  const en = `/en/insights/${item.slug}/`;
  const ar = `/insights/${item.slug}/`;
  let html = shell;
  html = applyMetadata(html, {
    title: `${item.title} | ${site.nameEn}`,
    description: item.description,
    en,
    ar,
    type: "article",
    graph: articleGraph(item),
  });
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${insightMain(item)}</main>`);
  html = setLanguageTarget(html, ar);
  html = setActiveNavigation(html, "/en/insights/");
  await writePage(en, html);

  const arabicPath = join(dist, "insights", item.slug, "index.html");
  let arabic = await readFile(arabicPath, "utf8");
  arabic = replaceAlternates(arabic, en, ar);
  arabic = setLanguageTarget(arabic, en);
  await writeFile(arabicPath, arabic, "utf8");
}

let servicesIndex = await readFile(join(dist, "en", "services", "index.html"), "utf8");
for (const service of services) {
  servicesIndex = servicesIndex.replace(
    `href="/en/contact/?service=${service.slug}">Discuss this capability ↗`,
    `href="/en/services/${service.slug}/">Explore capability ↗`,
  );
}
await writeFile(join(dist, "en", "services", "index.html"), servicesIndex, "utf8");

let insightsIndex = await readFile(join(dist, "en", "insights", "index.html"), "utf8");
for (const item of englishInsightDepth) {
  insightsIndex = insightsIndex.replace(
    '<a class="text-link" href="/en/contact/">Discuss this topic ↗</a>',
    `<a class="text-link" href="/en/insights/${item.slug}/">Read the insight ↗</a>`,
  );
}
await writeFile(join(dist, "en", "insights", "index.html"), insightsIndex, "utf8");

for (const htmlPath of await walkHtml(join(dist, "en"))) {
  let html = await readFile(htmlPath, "utf8");
  for (const service of services) {
    html = html.replaceAll(`/en/services/#${service.slug}`, `/en/services/${service.slug}/`);
  }
  await writeFile(htmlPath, html, "utf8");
}

const serviceRoutes = services.map((service) => `/en/services/${service.slug}/`);
const insightRoutes = englishInsightDepth.map((item) => `/en/insights/${item.slug}/`);
const newRoutes = [...serviceRoutes, ...insightRoutes];
let sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
const additions = newRoutes.filter((route) => !sitemap.includes(`<loc>${site.url}${route}</loc>`)).map((route) => `  <url><loc>${site.url}${route}</loc><lastmod>${buildDate}</lastmod><changefreq>monthly</changefreq><priority>${route.includes("/services/") ? "0.8" : "0.6"}</priority></url>`).join("\n");
if (additions) sitemap = sitemap.replace("</urlset>", `${additions}\n</urlset>`);
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");

const llmsPath = join(dist, "llms.txt");
let llms = await readFile(llmsPath, "utf8");
if (!llms.includes("## English service detail routes")) {
  llms += `\n\n## English service detail routes\n${services.map((service) => `- ${service.titleEn}: ${site.url}/en/services/${service.slug}/`).join("\n")}\n\n## English insight routes\n${englishInsightDepth.map((item) => `- ${item.title}: ${site.url}/en/insights/${item.slug}/`).join("\n")}\n`;
  await writeFile(llmsPath, llms, "utf8");
}

for (const service of services) {
  const en = `/en/services/${service.slug}/`;
  const ar = `/services/${service.slug}/`;
  const html = await readFile(join(dist, "en", "services", service.slug, "index.html"), "utf8");
  if (!html.includes(`<link rel="canonical" href="${site.url}${en}">`)) throw new Error(`Missing canonical for ${en}`);
  if (!html.includes(`hreflang="ar" href="${site.url}${ar}"`) || !html.includes(`hreflang="en" href="${site.url}${en}"`)) throw new Error(`Missing reciprocal hreflang for ${en}`);
  if (!html.includes('"@type":"Service"') || !html.includes('"@type":"FAQPage"')) throw new Error(`Missing service schema for ${en}`);
  const arabic = await readFile(join(dist, "services", service.slug, "index.html"), "utf8");
  if (!arabic.includes(`hreflang="en" href="${site.url}${en}"`)) throw new Error(`Arabic service missing English alternate: ${ar}`);
}

for (const item of englishInsightDepth) {
  const en = `/en/insights/${item.slug}/`;
  const ar = `/insights/${item.slug}/`;
  const html = await readFile(join(dist, "en", "insights", item.slug, "index.html"), "utf8");
  if (!html.includes(`<link rel="canonical" href="${site.url}${en}">`) || !html.includes('"@type":"Article"')) throw new Error(`Invalid English insight page: ${en}`);
  const arabic = await readFile(join(dist, "insights", item.slug, "index.html"), "utf8");
  if (!arabic.includes(`hreflang="en" href="${site.url}${en}"`)) throw new Error(`Arabic insight missing English alternate: ${ar}`);
}

const allEnglish = (await Promise.all((await walkHtml(join(dist, "en"))).map((file) => readFile(file, "utf8")))).join("\n");
for (const service of services) {
  if (allEnglish.includes(`/en/services/#${service.slug}`)) throw new Error(`English deep route fallback remains for service: ${service.slug}`);
}
for (const route of newRoutes) {
  if (!sitemap.includes(`<loc>${site.url}${route}</loc>`)) throw new Error(`Sitemap missing ${route}`);
}

console.log(`Generated ${services.length} English service pages and ${englishInsightDepth.length} English insight articles with reciprocal localization.`);
