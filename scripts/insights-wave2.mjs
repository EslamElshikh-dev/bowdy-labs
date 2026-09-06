import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { services, site } from "../src/content.mjs";
import { insightClusters } from "../src/insights-engine-content.mjs";
import { wave2Guides } from "../src/insights-wave2-content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const buildDate = new Date().toISOString().slice(0, 10);

const ui = {
  en: {
    home: "Home", insights: "Insights", read: "Read guide", all: "All insights", explore: "Explore topic",
    updated: "Updated", checklist: "Practical checklist", faq: "Common questions", related: "Related BOWDY LABS capability",
    evidence: "Practical boundary", ctaTitle: "Turn the framework into an implementation plan", discuss: "Discuss the use case",
    ctaCopy: "Bring the workflow, systems, constraints and success criteria. We can map the smallest useful next step.",
    boundary: "This guide explains architecture and operating decisions. It does not promise performance, regulatory outcomes or business results without implementation-specific evidence.",
    intent: "Search intent",
  },
  ar: {
    home: "الرئيسية", insights: "مدونتنا", read: "اقرأ الدليل", all: "كل المقالات", explore: "استكشف المحور",
    updated: "آخر تحديث", checklist: "قائمة عملية", faq: "أسئلة شائعة", related: "خدمة مرتبطة من BOWDY LABS",
    evidence: "حدود عملية", ctaTitle: "حوّل الإطار إلى خطة تنفيذ", discuss: "ناقش حالة الاستخدام",
    ctaCopy: "هات سير العمل والأنظمة والقيود ومعايير النجاح، ونحدد أصغر خطوة مفيدة قابلة للاختبار.",
    boundary: "هذا الدليل يشرح قرارات المعمارية والتشغيل ولا يعد بنتائج أداء أو امتثال أو نتائج تجارية دون دليل خاص بالتنفيذ الفعلي.",
    intent: "نية البحث",
  },
};

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const route = (lang, path) => `${lang === "en" ? "/en" : ""}${path}`;
const guideRoute = (lang, slug) => route(lang, `/insights/${slug}/`);
const hubRoute = (lang, slug) => route(lang, `/insights/topics/${slug}/`);
const indexRoute = (lang) => route(lang, "/insights/");

const alternate = (pathEn, pathAr) => `<link rel="alternate" hreflang="ar" href="${site.url}${pathAr}"><link rel="alternate" hreflang="ar-SA" href="${site.url}${pathAr}"><link rel="alternate" hreflang="en" href="${site.url}${pathEn}"><link rel="alternate" hreflang="x-default" href="${site.url}${pathAr}">`;

function replaceAlternates(html, pathEn, pathAr) {
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, "");
  return html.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n  ${alternate(pathEn, pathAr)}`);
}

function setLanguageTarget(html, target) {
  return html.replace(/(<a class="language-link" href=")[^"]*("[^>]*>)/g, `$1${target}$2`);
}

function replaceSchema(html, graph) {
  const script = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script>`;
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, script);
}

function metadata(html, { lang, pathEn, pathAr, title, description, graph }) {
  const canonicalPath = lang === "en" ? pathEn : pathAr;
  const canonical = `${site.url}${canonicalPath}`;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${lang === "en" ? "en_US" : "ar_SA"}">`)
    .replace(/<meta property="og:type" content="[^"]*">/, '<meta property="og:type" content="article">')
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(title)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);
  html = replaceAlternates(html, pathEn, pathAr);
  return replaceSchema(html, graph);
}

const organizationSchema = {
  "@type": "Organization", "@id": `${site.url}/#organization`, name: site.nameEn, alternateName: site.nameAr,
  url: site.url, logo: `${site.url}${site.logo}`, email: site.email, telephone: site.phone,
  address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
};
const websiteSchema = {
  "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.nameEn,
  inLanguage: ["ar-SA", "en"], publisher: { "@id": `${site.url}/#organization` },
};

function guideGraph(guide, cluster, lang) {
  const data = guide[lang];
  const path = guideRoute(lang, guide.slug);
  const canonical = `${site.url}${path}`;
  const hubCanonical = `${site.url}${hubRoute(lang, cluster.slug)}`;
  return [
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: data.title, description: data.description, inLanguage: lang === "en" ? "en" : "ar-SA", isPartOf: { "@id": `${site.url}/#website` }, mainEntity: { "@id": `${canonical}#article` }, dateModified: buildDate },
    { "@type": "Article", "@id": `${canonical}#article`, headline: data.title, description: data.description, url: canonical, mainEntityOfPage: { "@id": `${canonical}#webpage` }, inLanguage: lang === "en" ? "en" : "ar-SA", author: { "@id": `${site.url}/#organization` }, publisher: { "@id": `${site.url}/#organization` }, image: `${site.url}${site.shareImage}`, isPartOf: { "@id": `${hubCanonical}#webpage` }, dateModified: buildDate, about: cluster[lang].title },
    { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: data.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: ui[lang].home, item: `${site.url}${lang === "en" ? "/en/" : "/"}` },
      { "@type": "ListItem", position: 2, name: ui[lang].insights, item: `${site.url}${indexRoute(lang)}` },
      { "@type": "ListItem", position: 3, name: cluster[lang].kicker, item: hubCanonical },
      { "@type": "ListItem", position: 4, name: data.title, item: canonical },
    ] },
    organizationSchema, websiteSchema,
  ];
}

const breadcrumbs = (lang, items) => `<nav class="breadcrumbs container" aria-label="${lang === "en" ? "Breadcrumb" : "مسار التنقل"}"><ol>${items.map(([label, href], i) => `<li>${href && i < items.length - 1 ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}</li>`).join("")}</ol></nav>`;

function guideMain(guide, cluster, lang) {
  const c = ui[lang];
  const data = guide[lang];
  const service = services.find((item) => item.slug === guide.relatedService);
  const serviceName = service ? (lang === "en" ? service.titleEn : service.title) : "BOWDY LABS";
  const servicePath = service ? route(lang, `/services/${service.slug}/`) : route(lang, "/services/");
  return `${breadcrumbs(lang, [[c.home, lang === "en" ? "/en/" : "/"], [c.insights, indexRoute(lang)], [cluster[lang].kicker, hubRoute(lang, cluster.slug)], [data.title, guideRoute(lang, guide.slug)]])}
  <section class="page-hero section-pad"><div class="container page-hero-grid"><div class="reveal"><span class="eyebrow"><i aria-hidden="true"></i>${lang === "en" ? "WAVE 2 GUIDE" : "دليل WAVE 2"} · ${esc(data.category)}</span><h1>${esc(data.title)}</h1><p>${esc(data.intro)}</p><div class="hero-actions"><a class="button" href="${hubRoute(lang, cluster.slug)}">${esc(c.explore)} ↗</a><a class="button button-ghost" href="${indexRoute(lang)}">${esc(c.all)}</a></div></div><div class="page-hero-symbol reveal" aria-hidden="true"><span></span><img class="page-hero-logo" src="${site.logo}" width="72" height="72" alt=""></div></div></section>
  <article class="article section-pad"><div class="container article-body"><div class="article-meta"><span>${esc(data.category)}</span><span>${esc(data.readTime)}</span><span>${esc(c.intent)}: ${esc(guide.intent[lang])}</span><span>${esc(c.updated)} ${buildDate}</span></div>${data.sections.map(([heading, text], i) => `<section class="reveal"><span>${String(i + 1).padStart(2, "0")}</span><h2>${esc(heading)}</h2><p>${esc(text)}</p></section>`).join("")}<section class="reveal"><span>✓</span><h2>${esc(c.checklist)}</h2><div class="outcome-list">${data.checklist.map((item) => `<p><span>✓</span><span>${esc(item)}</span></p>`).join("")}</div></section><section class="article-note reveal"><h2>${esc(c.related)}</h2><p>${esc(serviceName)}</p><a class="text-link" href="${servicePath}">${esc(serviceName)} <span aria-hidden="true">↗</span></a></section><section class="article-note reveal"><h2>${lang === "en" ? "Part of this topic cluster" : "جزء من هذا المحور"}</h2><p>${esc(cluster[lang].description)}</p><a class="text-link" href="${hubRoute(lang, cluster.slug)}">${esc(cluster[lang].title)} <span aria-hidden="true">↗</span></a></section></div></article>
  <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal"><span class="eyebrow"><i aria-hidden="true"></i>FAQ</span><h2>${esc(c.faq)}</h2><p>${esc(c.boundary)}</p></div><div class="accordion">${data.faq.map(([q, a]) => `<details class="reveal"><summary>${esc(q)}<span>+</span></summary><p>${esc(a)}</p></details>`).join("")}</div></div></section>
  <section class="cta-section section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>${esc(c.evidence)}</span><h2>${esc(c.ctaTitle)}</h2><p>${esc(c.ctaCopy)}</p></div><a class="button" href="${lang === "en" ? "/en/contact/" : "/contact/"}?service=${guide.relatedService}">${esc(c.discuss)} <span aria-hidden="true">↗</span></a></div></section>`;
}

async function writePage(path, html) {
  const destination = join(dist, ...path.split("/").filter(Boolean), "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html, "utf8");
}

function mutateJsonLd(html, mutate) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (whole, raw) => {
    const parsed = JSON.parse(raw);
    mutate(parsed["@graph"] || []);
    return `<script type="application/ld+json">${JSON.stringify(parsed).replaceAll("<", "\\u003c")}</script>`;
  });
}

const shells = {
  en: await readFile(join(dist, "en", "insights", "ai-agent-business", "index.html"), "utf8"),
  ar: await readFile(join(dist, "insights", "ai-agent-business", "index.html"), "utf8"),
};

for (const guide of wave2Guides) {
  const cluster = insightClusters.find((item) => item.slug === guide.cluster);
  if (!cluster) throw new Error(`Unknown Wave 2 cluster: ${guide.cluster}`);
  for (const lang of ["en", "ar"]) {
    const pathEn = guideRoute("en", guide.slug);
    const pathAr = guideRoute("ar", guide.slug);
    const data = guide[lang];
    let html = shells[lang];
    html = metadata(html, { lang, pathEn, pathAr, title: `${data.title} | ${site.nameEn}`, description: data.description, graph: guideGraph(guide, cluster, lang) });
    html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${guideMain(guide, cluster, lang)}</main>`);
    html = setLanguageTarget(html, lang === "en" ? pathAr : pathEn);
    await writePage(guideRoute(lang, guide.slug), html);
  }
}

const selectedClusters = ["ai-agents", "arabic-ai", "automation-saudi-arabia"];
for (const clusterSlug of selectedClusters) {
  const cluster = insightClusters.find((item) => item.slug === clusterSlug);
  const additions = wave2Guides.filter((guide) => guide.cluster === clusterSlug);
  if (additions.length !== 3) throw new Error(`Expected 3 Wave 2 guides for ${clusterSlug}`);
  for (const lang of ["en", "ar"]) {
    const path = join(dist, ...(hubRoute(lang, clusterSlug).split("/").filter(Boolean)), "index.html");
    let html = await readFile(path, "utf8");
    const cards = additions.map((guide) => `<article class="case-study-card reveal" style="--case-accent:${cluster.accent}"><small>${esc(guide[lang].category)} · ${esc(guide[lang].readTime)} · WAVE 2</small><h3>${esc(guide[lang].title)}</h3><p>${esc(guide[lang].description)}</p><a class="text-link" href="${guideRoute(lang, guide.slug)}">${esc(ui[lang].read)} <span aria-hidden="true">↗</span></a></article>`).join("");
    html = html.replace(/(<section class="section-pad" id="guides">[\s\S]*?<div class="case-study-grid">)([\s\S]*?)(<\/div>)/, `$1$2${cards}$3`);
    html = html.replace(/(<article><small>(?:Supporting guides|أدلة داعمة)<\/small><strong>)2(<\/strong><\/article>)/, "$15$2");
    html = mutateJsonLd(html, (graph) => {
      const itemList = graph.find((item) => item["@type"] === "ItemList" && String(item["@id"] || "").endsWith("#guides"));
      if (!itemList) throw new Error(`Hub ItemList missing for ${clusterSlug}/${lang}`);
      const existing = Array.isArray(itemList.itemListElement) ? itemList.itemListElement : [];
      additions.forEach((guide, index) => existing.push({ "@type": "ListItem", position: existing.length + 1, name: guide[lang].title, url: `${site.url}${guideRoute(lang, guide.slug)}` }));
      itemList.itemListElement = existing;
      itemList.numberOfItems = existing.length;
    });
    await writeFile(path, html, "utf8");
  }
}

for (const lang of ["en", "ar"]) {
  const indexPath = join(dist, ...(indexRoute(lang).split("/").filter(Boolean)), "index.html");
  let html = await readFile(indexPath, "utf8");
  for (const clusterSlug of selectedClusters) {
    const cluster = insightClusters.find((item) => item.slug === clusterSlug);
    html = html.replace(`${esc(cluster[lang].kicker)} · 2 GUIDES`, `${esc(cluster[lang].kicker)} · 5 GUIDES`);
  }
  await writeFile(indexPath, html, "utf8");
}

const routes = wave2Guides.flatMap((guide) => [guideRoute("ar", guide.slug), guideRoute("en", guide.slug)]);
let sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
const additions = routes.filter((path) => !sitemap.includes(`<loc>${site.url}${path}</loc>`)).map((path) => `  <url><loc>${site.url}${path}</loc><lastmod>${buildDate}</lastmod><changefreq>monthly</changefreq><priority>0.65</priority></url>`).join("\n");
if (additions) sitemap = sitemap.replace("</urlset>", `${additions}\n</urlset>`);
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");

const llmsPath = join(dist, "llms.txt");
let llms = await readFile(llmsPath, "utf8");
const marker = "## BOWDY Insights Engine — Wave 2";
if (!llms.includes(marker)) {
  llms += `\n\n${marker}\n${wave2Guides.map((guide) => `- ${guide.en.title}: ${site.url}${guideRoute("en", guide.slug)} | Arabic: ${site.url}${guideRoute("ar", guide.slug)}`).join("\n")}\n`;
  await writeFile(llmsPath, llms, "utf8");
}

for (const guide of wave2Guides) {
  for (const lang of ["en", "ar"]) {
    const own = guideRoute(lang, guide.slug);
    const other = guideRoute(lang === "en" ? "ar" : "en", guide.slug);
    const file = join(dist, ...(own.split("/").filter(Boolean)), "index.html");
    const html = await readFile(file, "utf8");
    if (!html.includes(`<link rel="canonical" href="${site.url}${own}">`)) throw new Error(`Missing canonical: ${own}`);
    if (!html.includes(`href="${other}"`) || !html.includes('"@type":"Article"') || !html.includes('"@type":"FAQPage"')) throw new Error(`Invalid Wave 2 page: ${own}`);
    if (!html.includes(hubRoute(lang, guide.cluster))) throw new Error(`Missing cluster backlink: ${own}`);
    if (!sitemap.includes(`<loc>${site.url}${own}</loc>`)) throw new Error(`Missing sitemap route: ${own}`);
  }
}

for (const clusterSlug of selectedClusters) {
  for (const lang of ["en", "ar"]) {
    const file = join(dist, ...(hubRoute(lang, clusterSlug).split("/").filter(Boolean)), "index.html");
    const html = await readFile(file, "utf8");
    const clusterGuides = wave2Guides.filter((guide) => guide.cluster === clusterSlug);
    for (const guide of clusterGuides) if (!html.includes(guideRoute(lang, guide.slug))) throw new Error(`Hub missing Wave 2 guide ${guide.slug}`);
    if (!html.includes("<strong>5</strong>") || !html.includes('"numberOfItems":5')) throw new Error(`Hub guide count not upgraded: ${clusterSlug}/${lang}`);
  }
}

console.log(`BOWDY Insights Wave 2 generated ${wave2Guides.length} bilingual guides across 3 priority clusters.`);
