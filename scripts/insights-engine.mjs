import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { services, site } from "../src/content.mjs";
import { insightClusters, insightGuides } from "../src/insights-engine-content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const buildDate = new Date().toISOString().slice(0, 10);

const copy = {
  en: {
    home: "Home", insights: "Insights", topics: "Topic Clusters", read: "Read guide", explore: "Explore topic", all: "All insights",
    hubLabel: "TOPIC HUB", guideLabel: "PRACTICAL GUIDE", questions: "Questions this cluster helps answer", questionsCopy: "The cluster is organized around decisions a product, operations or technology team actually needs to make.",
    guides: "Start with these guides", guidesCopy: "Each guide answers a distinct search intent and links back to this hub so the topic can expand without duplicate pages.",
    overview: "Build understanding before choosing the tool", faq: "Common questions", related: "Related BOWDY LABS capability", legacy: "Existing guide in this topic",
    indexTitle: "BOWDY Insights Engine: AI knowledge organized by topic, not random posts",
    indexDescription: "Explore bilingual BOWDY LABS topic clusters on AI Agents, Enterprise RAG, Arabic AI, AI Governance and AI Automation in Saudi Arabia.",
    indexIntro: "A bilingual knowledge system built around five strategic AI topics. Each hub owns one broad intent, while supporting guides answer narrower questions and connect back to the same topic architecture.",
    clusterHeading: "Five strategic topic clusters", clusterCopy: "Each hub is designed to become a durable authority page rather than a collection of disconnected articles.",
    moreHeading: "Existing practical guides", moreCopy: "These articles remain useful and are connected into the wider knowledge architecture where relevant.",
    evidence: "Practical boundary", evidenceCopy: "These guides explain architecture and operating decisions. They do not promise performance, regulatory outcomes or business results without evidence specific to the implementation.",
    checklist: "Practical checklist", ctaTitle: "Turn the framework into an implementation plan", ctaCopy: "Bring the workflow, knowledge sources, constraints and success criteria. We can map the smallest useful next step.",
    discuss: "Discuss the use case", updated: "Updated",
  },
  ar: {
    home: "الرئيسية", insights: "مدونتنا", topics: "المحاور المعرفية", read: "اقرأ الدليل", explore: "استكشف المحور", all: "كل المقالات",
    hubLabel: "TOPIC HUB", guideLabel: "دليل عملي", questions: "الأسئلة التي يساعدك هذا المحور على حسمها", questionsCopy: "المحتوى منظم حول قرارات حقيقية تحتاج فرق المنتج والعمليات والتقنية إلى اتخاذها.",
    guides: "ابدأ بهذه الأدلة", guidesCopy: "كل دليل يستهدف نية بحث مختلفة ويرجع إلى المحور الأساسي حتى نتوسع بدون صفحات مكررة أو تزاحم كلمات.",
    overview: "افهم النظام قبل اختيار الأداة", faq: "أسئلة شائعة", related: "خدمة مرتبطة من BOWDY LABS", legacy: "دليل موجود داخل هذا المحور",
    indexTitle: "BOWDY Insights Engine: معرفة AI منظمة بمحاور لا مقالات عشوائية",
    indexDescription: "استكشف محاور باودي لابز الثنائية اللغة حول وكلاء AI وEnterprise RAG والذكاء الاصطناعي العربي وحوكمة AI وأتمتة الأعمال في السعودية.",
    indexIntro: "نظام معرفة ثنائي اللغة مبني حول خمسة موضوعات استراتيجية في الذكاء الاصطناعي. كل Hub يملك نية بحث واسعة، بينما تجيب الأدلة الداعمة عن أسئلة أضيق وترتبط بالمحور نفسه.",
    clusterHeading: "خمسة محاور استراتيجية", clusterCopy: "كل محور مصمم ليصبح صفحة مرجعية قابلة للنمو بدل مجموعة مقالات منفصلة لا تربطها بنية واضحة.",
    moreHeading: "أدلة عملية موجودة", moreCopy: "نحافظ على المقالات المفيدة الحالية ونربط المناسب منها داخل المعمارية المعرفية الجديدة.",
    evidence: "حدود عملية", evidenceCopy: "هذه الأدلة تشرح قرارات المعمارية والتشغيل، ولا تعد بنتائج أداء أو امتثال أو نتائج تجارية دون دليل خاص بالتنفيذ الفعلي.",
    checklist: "قائمة عملية", ctaTitle: "حوّل الإطار إلى خطة تنفيذ", ctaCopy: "هات سير العمل ومصادر المعرفة والقيود ومعايير النجاح، ونحدد أصغر خطوة مفيدة قابلة للاختبار.",
    discuss: "ناقش حالة الاستخدام", updated: "آخر تحديث",
  },
};

const legacyMeta = {
  "ai-agent-business": {
    en: "How to Start an AI Agent Inside Your Company Without Unnecessary Risk",
    ar: "كيف تبدأ وكيل ذكاء اصطناعي داخل شركتك دون مخاطرة؟",
  },
  "secure-digital-product": {
    en: "Secure Digital Products: Decisions That Should Happen Before Code",
    ar: "المنتج الرقمي الآمن: قرارات يجب أن تبدأ قبل كتابة الكود",
  },
  "search-ready-website": {
    en: "Building a Website Ready for Search Engines and AI Systems",
    ar: "بناء موقع جاهز لمحركات البحث وأنظمة الذكاء الاصطناعي",
  },
};

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const route = (lang, path) => `${lang === "en" ? "/en" : ""}${path}`;
const hubRoute = (lang, slug) => route(lang, `/insights/topics/${slug}/`);
const guideRoute = (lang, slug) => route(lang, `/insights/${slug}/`);
const indexRoute = (lang) => route(lang, "/insights/");
const alternate = (pathEn, pathAr) => `<link rel="alternate" hreflang="ar" href="${site.url}${pathAr}"><link rel="alternate" hreflang="ar-SA" href="${site.url}${pathAr}"><link rel="alternate" hreflang="en" href="${site.url}${pathEn}"><link rel="alternate" hreflang="x-default" href="${site.url}${pathAr}">`;

function replaceAlternates(html, pathEn, pathAr) {
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, "");
  return html.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n  ${alternate(pathEn, pathAr)}`);
}

function ensurePositioning(html) {
  if (html.includes('/assets/css/positioning.css')) return html;
  return html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/positioning.css">\n</head>');
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

function metadata(html, { lang, pathEn, pathAr, title, description, type = "website", graph }) {
  const canonicalPath = lang === "en" ? pathEn : pathAr;
  const canonical = `${site.url}${canonicalPath}`;
  html = ensurePositioning(html)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${lang === "en" ? "en_US" : "ar_SA"}">`)
    .replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${type}">`)
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

function indexGraph(lang) {
  const path = indexRoute(lang);
  const canonical = `${site.url}${path}`;
  const c = copy[lang];
  return [
    { "@type": "CollectionPage", "@id": `${canonical}#webpage`, url: canonical, name: c.indexTitle, description: c.indexDescription, inLanguage: lang === "en" ? "en" : "ar-SA", isPartOf: { "@id": `${site.url}/#website` }, dateModified: buildDate },
    { "@type": "ItemList", "@id": `${canonical}#topic-clusters`, name: c.clusterHeading, numberOfItems: insightClusters.length, itemListElement: insightClusters.map((cluster, i) => ({ "@type": "ListItem", position: i + 1, name: cluster[lang].title, url: `${site.url}${hubRoute(lang, cluster.slug)}` })) },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: c.home, item: `${site.url}${lang === "en" ? "/en/" : "/"}` },
      { "@type": "ListItem", position: 2, name: c.insights, item: canonical },
    ] },
    organizationSchema, websiteSchema,
  ];
}

function hubGraph(cluster, lang) {
  const c = copy[lang];
  const data = cluster[lang];
  const path = hubRoute(lang, cluster.slug);
  const canonical = `${site.url}${path}`;
  const guides = insightGuides.filter((guide) => guide.cluster === cluster.slug);
  return [
    { "@type": "CollectionPage", "@id": `${canonical}#webpage`, url: canonical, name: data.title, description: data.description, inLanguage: lang === "en" ? "en" : "ar-SA", isPartOf: { "@id": `${site.url}/#website` }, dateModified: buildDate },
    { "@type": "ItemList", "@id": `${canonical}#guides`, name: data.title, numberOfItems: guides.length, itemListElement: guides.map((guide, i) => ({ "@type": "ListItem", position: i + 1, name: guide[lang].title, url: `${site.url}${guideRoute(lang, guide.slug)}` })) },
    { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: data.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: c.home, item: `${site.url}${lang === "en" ? "/en/" : "/"}` },
      { "@type": "ListItem", position: 2, name: c.insights, item: `${site.url}${indexRoute(lang)}` },
      { "@type": "ListItem", position: 3, name: data.title, item: canonical },
    ] },
    organizationSchema, websiteSchema,
  ];
}

function guideGraph(guide, cluster, lang) {
  const c = copy[lang];
  const data = guide[lang];
  const path = guideRoute(lang, guide.slug);
  const canonical = `${site.url}${path}`;
  const hubCanonical = `${site.url}${hubRoute(lang, cluster.slug)}`;
  return [
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: data.title, description: data.description, inLanguage: lang === "en" ? "en" : "ar-SA", isPartOf: { "@id": `${site.url}/#website` }, mainEntity: { "@id": `${canonical}#article` }, dateModified: buildDate },
    { "@type": "Article", "@id": `${canonical}#article`, headline: data.title, description: data.description, url: canonical, mainEntityOfPage: { "@id": `${canonical}#webpage` }, inLanguage: lang === "en" ? "en" : "ar-SA", author: { "@id": `${site.url}/#organization` }, publisher: { "@id": `${site.url}/#organization` }, image: `${site.url}${site.shareImage}`, isPartOf: { "@id": `${hubCanonical}#webpage` }, dateModified: buildDate },
    { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: data.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: c.home, item: `${site.url}${lang === "en" ? "/en/" : "/"}` },
      { "@type": "ListItem", position: 2, name: c.insights, item: `${site.url}${indexRoute(lang)}` },
      { "@type": "ListItem", position: 3, name: cluster[lang].kicker, item: hubCanonical },
      { "@type": "ListItem", position: 4, name: data.title, item: canonical },
    ] },
    organizationSchema, websiteSchema,
  ];
}

const breadcrumbs = (lang, items) => `<nav class="breadcrumbs container" aria-label="${lang === "en" ? "Breadcrumb" : "مسار التنقل"}"><ol>${items.map(([label, href], i) => `<li>${href && i < items.length - 1 ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}</li>`).join("")}</ol></nav>`;

function topicCard(cluster, lang) {
  const data = cluster[lang];
  const guides = insightGuides.filter((guide) => guide.cluster === cluster.slug);
  return `<article class="case-study-card reveal" style="--case-accent:${cluster.accent}"><small>${esc(data.kicker)} · ${guides.length} GUIDES</small><h3>${esc(data.title)}</h3><p>${esc(data.intro)}</p><div class="case-study-tags">${guides.map((guide) => `<span>${esc(guide[lang].category)}</span>`).join("")}</div><a class="text-link" href="${hubRoute(lang, cluster.slug)}">${copy[lang].explore} <span aria-hidden="true">↗</span></a></article>`;
}

function indexMain(lang) {
  const c = copy[lang];
  const existing = Object.entries(legacyMeta).map(([slug, names]) => `<article class="service-card reveal"><small>${lang === "en" ? "EXISTING GUIDE" : "دليل موجود"}</small><h3>${esc(names[lang])}</h3><a class="text-link" href="${guideRoute(lang, slug)}">${c.read} <span aria-hidden="true">↗</span></a></article>`).join("");
  return `<section class="page-hero section-pad"><div class="container page-hero-grid"><div class="reveal"><span class="eyebrow"><i aria-hidden="true"></i>BOWDY INSIGHTS ENGINE</span><h1>${esc(c.indexTitle)}</h1><p>${esc(c.indexIntro)}</p></div><div class="page-hero-symbol reveal" aria-hidden="true"><span></span><img class="page-hero-logo" src="${site.logo}" width="72" height="72" alt=""></div></div></section>
  <section class="section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>TOPIC CLUSTERS</span><h2>${esc(c.clusterHeading)}</h2><p>${esc(c.clusterCopy)}</p></div><div class="case-study-grid">${insightClusters.map((cluster) => topicCard(cluster, lang)).join("")}</div></div></section>
  <section class="section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>FOUNDATION LIBRARY</span><h2>${esc(c.moreHeading)}</h2><p>${esc(c.moreCopy)}</p></div><div class="services-grid">${existing}</div></div></section>
  <section class="section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>${esc(c.evidence)}</span><h2>${lang === "en" ? "Architecture first. Claims only with evidence." : "المعمارية أولًا، والادعاءات فقط بالدليل."}</h2><p>${esc(c.evidenceCopy)}</p></div><a class="button" href="${lang === "en" ? "/en/contact/" : "/contact/"}">${esc(c.discuss)} <span aria-hidden="true">↗</span></a></div></section>`;
}

function hubMain(cluster, lang) {
  const c = copy[lang];
  const data = cluster[lang];
  const guides = insightGuides.filter((guide) => guide.cluster === cluster.slug);
  const service = services.find((item) => item.slug === cluster.relatedService);
  const serviceName = service ? (lang === "en" ? service.titleEn : service.title) : "BOWDY LABS";
  const servicePath = service ? route(lang, `/services/${service.slug}/`) : (lang === "en" ? "/en/services/" : "/services/");
  const legacy = cluster.legacy.map((slug) => legacyMeta[slug] ? `<a class="text-link" href="${guideRoute(lang, slug)}">${esc(legacyMeta[slug][lang])} <span aria-hidden="true">↗</span></a>` : "").join("");
  return `${breadcrumbs(lang, [[c.home, lang === "en" ? "/en/" : "/"], [c.insights, indexRoute(lang)], [data.title, hubRoute(lang, cluster.slug)]])}
  <section class="case-hero"><div class="container case-hero-grid"><div class="reveal"><span class="case-kicker">${esc(c.hubLabel)} · ${esc(data.kicker)}</span><h1>${esc(data.title)}</h1><p>${esc(data.intro)}</p><div class="hero-actions"><a class="button" href="#guides">${esc(c.guides)}</a><a class="button button-ghost" href="${indexRoute(lang)}">${esc(c.all)}</a></div></div><aside class="case-summary reveal"><article><small>${lang === "en" ? "Cluster" : "المحور"}</small><strong>${esc(data.kicker)}</strong></article><article><small>${lang === "en" ? "Supporting guides" : "أدلة داعمة"}</small><strong>${guides.length}</strong></article><article><small>${c.updated}</small><strong>${buildDate}</strong></article></aside></div></section>
  <section class="section-pad"><div class="container case-story">${data.overview.map((paragraph, i) => `<article class="case-panel reveal"><span>0${i + 1} · ${i === 0 ? esc(c.overview) : (lang === "en" ? "OPERATING MODEL" : "نموذج التشغيل")}</span><h2>${i === 0 ? esc(c.overview) : (lang === "en" ? "What the cluster covers" : "ما الذي يغطيه المحور؟")}</h2><p>${esc(paragraph)}</p></article>`).join("")}</div></section>
  <section class="section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>${lang === "en" ? "DECISION QUESTIONS" : "أسئلة القرار"}</span><h2>${esc(c.questions)}</h2><p>${esc(c.questionsCopy)}</p></div><div class="deliverables-grid">${data.questions.map((question, i) => `<article class="deliverable-card reveal"><div><span>${String(i + 1).padStart(2, "0")}</span><span>?</span></div><h3>${esc(question)}</h3></article>`).join("")}</div></div></section>
  <section class="section-pad" id="guides"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>CLUSTER CONTENT</span><h2>${esc(c.guides)}</h2><p>${esc(c.guidesCopy)}</p></div><div class="case-study-grid">${guides.map((guide) => `<article class="case-study-card reveal" style="--case-accent:${cluster.accent}"><small>${esc(guide[lang].category)} · ${esc(guide[lang].readTime)}</small><h3>${esc(guide[lang].title)}</h3><p>${esc(guide[lang].description)}</p><a class="text-link" href="${guideRoute(lang, guide.slug)}">${esc(c.read)} <span aria-hidden="true">↗</span></a></article>`).join("")}</div>${legacy ? `<div class="article-note reveal" style="margin-top:2rem"><h2>${esc(c.legacy)}</h2>${legacy}</div>` : ""}</div></section>
  <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal"><span class="eyebrow"><i aria-hidden="true"></i>FAQ</span><h2>${esc(c.faq)}</h2><p>${esc(c.evidenceCopy)}</p></div><div class="accordion">${data.faq.map(([q, a]) => `<details class="reveal"><summary>${esc(q)}<span>+</span></summary><p>${esc(a)}</p></details>`).join("")}</div></div></section>
  <section class="section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>${esc(c.related)}</span><h2>${esc(serviceName)}</h2><p>${esc(c.ctaCopy)}</p></div><div class="case-nav"><a class="button" href="${servicePath}">${esc(serviceName)} <span aria-hidden="true">↗</span></a><a class="button button-ghost" href="${lang === "en" ? "/en/contact/" : "/contact/"}">${esc(c.discuss)}</a></div></div></section>`;
}

function guideMain(guide, cluster, lang) {
  const c = copy[lang];
  const data = guide[lang];
  const service = services.find((item) => item.slug === guide.relatedService);
  const serviceName = service ? (lang === "en" ? service.titleEn : service.title) : "BOWDY LABS";
  const servicePath = service ? route(lang, `/services/${service.slug}/`) : route(lang, "/services/");
  return `${breadcrumbs(lang, [[c.home, lang === "en" ? "/en/" : "/"], [c.insights, indexRoute(lang)], [cluster[lang].kicker, hubRoute(lang, cluster.slug)], [data.title, guideRoute(lang, guide.slug)]])}
  <section class="page-hero section-pad"><div class="container page-hero-grid"><div class="reveal"><span class="eyebrow"><i aria-hidden="true"></i>${esc(c.guideLabel)} · ${esc(data.category)}</span><h1>${esc(data.title)}</h1><p>${esc(data.intro)}</p><div class="hero-actions"><a class="button" href="${hubRoute(lang, cluster.slug)}">${esc(c.explore)} ↗</a><a class="button button-ghost" href="${indexRoute(lang)}">${esc(c.all)}</a></div></div><div class="page-hero-symbol reveal" aria-hidden="true"><span></span><img class="page-hero-logo" src="${site.logo}" width="72" height="72" alt=""></div></div></section>
  <article class="article section-pad"><div class="container article-body"><div class="article-meta"><span>${esc(data.category)}</span><span>${esc(data.readTime)}</span><span>${esc(c.updated)} ${buildDate}</span></div>${data.sections.map(([heading, text], i) => `<section class="reveal"><span>${String(i + 1).padStart(2, "0")}</span><h2>${esc(heading)}</h2><p>${esc(text)}</p></section>`).join("")}<section class="reveal"><span>✓</span><h2>${esc(c.checklist)}</h2><div class="outcome-list">${data.checklist.map((item) => `<p><span>✓</span><span>${esc(item)}</span></p>`).join("")}</div></section><section class="article-note reveal"><h2>${esc(c.related)}</h2><p>${esc(serviceName)}</p><a class="text-link" href="${servicePath}">${esc(serviceName)} <span aria-hidden="true">↗</span></a></section><section class="article-note reveal"><h2>${lang === "en" ? "Part of this topic cluster" : "جزء من هذا المحور"}</h2><p>${esc(cluster[lang].description)}</p><a class="text-link" href="${hubRoute(lang, cluster.slug)}">${esc(cluster[lang].title)} <span aria-hidden="true">↗</span></a></section></div></article>
  <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal"><span class="eyebrow"><i aria-hidden="true"></i>FAQ</span><h2>${esc(c.faq)}</h2><p>${esc(c.evidenceCopy)}</p></div><div class="accordion">${data.faq.map(([q, a]) => `<details class="reveal"><summary>${esc(q)}<span>+</span></summary><p>${esc(a)}</p></details>`).join("")}</div></div></section>
  <section class="cta-section section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>${esc(c.evidence)}</span><h2>${esc(c.ctaTitle)}</h2><p>${esc(c.ctaCopy)}</p></div><a class="button" href="${lang === "en" ? "/en/contact/" : "/contact/"}?service=${guide.relatedService}">${esc(c.discuss)} <span aria-hidden="true">↗</span></a></div></section>`;
}

async function writePage(path, html) {
  const destination = join(dist, ...path.split("/").filter(Boolean), "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html, "utf8");
}

const shells = {
  en: await readFile(join(dist, "en", "about", "index.html"), "utf8"),
  ar: await readFile(join(dist, "about", "index.html"), "utf8"),
};

for (const lang of ["en", "ar"]) {
  const c = copy[lang];
  const pathEn = "/en/insights/";
  const pathAr = "/insights/";
  let html = shells[lang];
  html = metadata(html, { lang, pathEn, pathAr, title: `${c.indexTitle} | ${site.nameEn}`, description: c.indexDescription, graph: indexGraph(lang) });
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${indexMain(lang)}</main>`);
  html = setLanguageTarget(html, lang === "en" ? pathAr : pathEn);
  html = setActiveNavigation(html, indexRoute(lang));
  await writePage(indexRoute(lang), html);
}

for (const cluster of insightClusters) {
  for (const lang of ["en", "ar"]) {
    const pathEn = hubRoute("en", cluster.slug);
    const pathAr = hubRoute("ar", cluster.slug);
    const data = cluster[lang];
    let html = shells[lang];
    html = metadata(html, { lang, pathEn, pathAr, title: `${data.title} | ${site.nameEn}`, description: data.description, graph: hubGraph(cluster, lang) });
    html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${hubMain(cluster, lang)}</main>`);
    html = setLanguageTarget(html, lang === "en" ? pathAr : pathEn);
    html = setActiveNavigation(html, indexRoute(lang));
    await writePage(lang === "en" ? pathEn : pathAr, html);
  }
}

for (const guide of insightGuides) {
  const cluster = insightClusters.find((item) => item.slug === guide.cluster);
  if (!cluster) throw new Error(`Missing cluster for guide ${guide.slug}`);
  for (const lang of ["en", "ar"]) {
    const pathEn = guideRoute("en", guide.slug);
    const pathAr = guideRoute("ar", guide.slug);
    const data = guide[lang];
    let html = shells[lang];
    html = metadata(html, { lang, pathEn, pathAr, title: `${data.title} | ${site.nameEn}`, description: data.description, type: "article", graph: guideGraph(guide, cluster, lang) });
    html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${guideMain(guide, cluster, lang)}</main>`);
    html = setLanguageTarget(html, lang === "en" ? pathAr : pathEn);
    html = setActiveNavigation(html, indexRoute(lang));
    await writePage(lang === "en" ? pathEn : pathAr, html);
  }
}

for (const cluster of insightClusters) {
  for (const slug of cluster.legacy) {
    if (!legacyMeta[slug]) continue;
    for (const lang of ["en", "ar"]) {
      const path = join(dist, ...(guideRoute(lang, slug).split("/").filter(Boolean)), "index.html");
      let html;
      try { html = await readFile(path, "utf8"); } catch { continue; }
      const marker = `data-topic-hub="${cluster.slug}"`;
      if (!html.includes(marker)) {
        const block = `<section class="section-pad related-services-section" ${marker}><div class="container"><div class="article-note reveal"><h2>${lang === "en" ? "Continue with the topic hub" : "كمل داخل المحور"}</h2><p>${esc(cluster[lang].description)}</p><a class="text-link" href="${hubRoute(lang, cluster.slug)}">${esc(cluster[lang].title)} <span aria-hidden="true">↗</span></a></div></div></section>`;
        html = html.replace("</main>", `${block}</main>`);
        await writeFile(path, html, "utf8");
      }
    }
  }
}

const allRoutes = [
  ...insightClusters.flatMap((cluster) => [hubRoute("ar", cluster.slug), hubRoute("en", cluster.slug)]),
  ...insightGuides.flatMap((guide) => [guideRoute("ar", guide.slug), guideRoute("en", guide.slug)]),
];
let sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
for (const path of allRoutes) {
  const escaped = `${site.url}${path}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  sitemap = sitemap.replace(new RegExp(`\\s*<url><loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, "g"), "");
}
const sitemapEntries = allRoutes.map((path) => {
  const isHub = path.includes("/topics/");
  return `  <url><loc>${site.url}${path}</loc><lastmod>${buildDate}</lastmod><changefreq>monthly</changefreq><priority>${isHub ? "0.8" : "0.7"}</priority></url>`;
}).join("\n");
sitemap = sitemap.replace("</urlset>", `${sitemapEntries}\n</urlset>`);
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");

const llmsPath = join(dist, "llms.txt");
let llms = await readFile(llmsPath, "utf8");
const startMarker = "## BOWDY Insights Engine";
const endMarker = "## End BOWDY Insights Engine";
const section = `${startMarker}\n\n### Arabic topic hubs\n${insightClusters.map((cluster) => `- ${cluster.ar.title}: ${site.url}${hubRoute("ar", cluster.slug)}`).join("\n")}\n\n### English topic hubs\n${insightClusters.map((cluster) => `- ${cluster.en.title}: ${site.url}${hubRoute("en", cluster.slug)}`).join("\n")}\n\n### Bilingual supporting guides\n${insightGuides.map((guide) => `- ${guide.en.title}: ${site.url}${guideRoute("en", guide.slug)} | AR ${site.url}${guideRoute("ar", guide.slug)}`).join("\n")}\n\n${endMarker}`;
if (llms.includes(startMarker) && llms.includes(endMarker)) {
  llms = llms.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), section);
} else {
  llms += `\n\n${section}\n`;
}
await writeFile(llmsPath, llms, "utf8");

for (const cluster of insightClusters) {
  for (const lang of ["en", "ar"]) {
    const path = hubRoute(lang, cluster.slug);
    const other = hubRoute(lang === "en" ? "ar" : "en", cluster.slug);
    const html = await readFile(join(dist, ...path.split("/").filter(Boolean), "index.html"), "utf8");
    if (!html.includes(`<link rel="canonical" href="${site.url}${path}">`)) throw new Error(`Missing canonical: ${path}`);
    if (!html.includes(`hreflang="${lang === "en" ? "ar" : "en"}" href="${site.url}${other}"`)) throw new Error(`Missing reciprocal hreflang: ${path}`);
    if (!html.includes('"@type":"CollectionPage"') || !html.includes('"@type":"FAQPage"')) throw new Error(`Missing hub schema: ${path}`);
  }
}

for (const guide of insightGuides) {
  for (const lang of ["en", "ar"]) {
    const path = guideRoute(lang, guide.slug);
    const html = await readFile(join(dist, ...path.split("/").filter(Boolean), "index.html"), "utf8");
    if (!html.includes('"@type":"Article"') || !html.includes('"@type":"FAQPage"')) throw new Error(`Missing guide schema: ${path}`);
    if (!html.includes(hubRoute(lang, guide.cluster))) throw new Error(`Guide missing cluster backlink: ${path}`);
    if (!sitemap.includes(`<loc>${site.url}${path}</loc>`)) throw new Error(`Sitemap missing guide: ${path}`);
  }
}

for (const lang of ["en", "ar"]) {
  const html = await readFile(join(dist, ...(indexRoute(lang).split("/").filter(Boolean)), "index.html"), "utf8");
  for (const cluster of insightClusters) {
    if (!html.includes(hubRoute(lang, cluster.slug))) throw new Error(`Insights index missing cluster ${cluster.slug} for ${lang}`);
  }
}

console.log(`BOWDY Insights Engine generated ${insightClusters.length} bilingual topic hubs and ${insightGuides.length} bilingual supporting guides.`);
