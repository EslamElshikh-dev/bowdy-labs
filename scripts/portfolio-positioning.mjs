import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { agents } from "../src/agents.mjs";
import { site } from "../src/content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const buildDate = new Date().toISOString().slice(0, 10);

const cases = [
  {
    slug: "tawod",
    title: "شركة تعاود للمقاولات",
    kicker: "مقاولات · الرياض",
    summary: "منصة شركة مقاولات عربية تربط الخدمات والبحث المحلي والتحويل داخل بنية قابلة للتوسع.",
    challenge: "كان المطلوب تحويل حضور رقمي تقليدي إلى منصة أوضح للخدمات والمناطق، بحيث يفهم العميل ما الذي تقدمه الشركة ويصل إلى الاتصال أو واتساب بسرعة، مع أساس تقني يساعد الفهرسة والنمو المحلي.",
    solution: "بُنيت بنية خدمات ومحتوى عربية، وصفحات مهيأة للبحث المحلي، وتجربة mobile-first، وربط واضح بين نية الباحث وصفحة الخدمة ودعوة الإجراء، مع تحسينات للبيانات المنظمة والميتا والروابط الداخلية.",
    outcomes: ["هيكل خدمات ومناطق أوضح للمستخدم ومحرك البحث", "دعوات إجراء واتصال وواتساب أقرب لنقاط القرار", "قاعدة تقنية قابلة لإضافة صفحات ومدن ومحتوى دون إعادة البناء"],
    tags: ["Web Development", "Technical SEO", "Local SEO"],
    stack: "Static/React delivery · Schema · Local SEO · Conversion UX",
    liveUrl: "https://tawodco.com/",
    accent: "#24d8ff",
  },
  {
    slug: "ameen",
    title: "أمين لخدمات الصيانة",
    kicker: "خدمات منزلية · الرياض",
    summary: "تجربة هبوط سريعة لنشاط خدمات محلية، تضع الاتصال والبحث المحلي في قلب الصفحة.",
    challenge: "الخدمة المحلية تحتاج قرارًا سريعًا على الجوال: فهم الخدمة، التأكد من نطاق العمل، ثم التواصل. أي ازدحام بصري أو مسار طويل يرفع التسرب ويضعف قيمة الزيارة.",
    solution: "تم تصميم صفحة هبوط خفيفة ومتجاوبة، مع تسلسل محتوى يخدم نية البحث المحلي، وأزرار اتصال مباشرة، ورسائل خدمة مختصرة، وهيكلة تساعد المستخدم ومحرك البحث على فهم النشاط بسرعة.",
    outcomes: ["رحلة جوال أقصر من البحث إلى التواصل", "محتوى خدمات محلي منظم بدل صفحة عامة مبهمة", "واجهة خفيفة قابلة للنشر والتعديل بسرعة"],
    tags: ["Landing Page", "Conversion UX", "Local Search"],
    stack: "Responsive UI · Local content · Direct-response UX",
    liveUrl: "https://ameenservse.vercel.app/",
    accent: "#8b5cff",
  },
  {
    slug: "alargan-crm",
    title: "Alargan CRM — Agent-Led Proposal",
    kicker: "CRM عقاري · تجربة عرض تفاعلية",
    summary: "تحويل عرض CRM من صفحات تقليدية إلى تجربة يقودها وكيل ذكي يشرح القيمة والمنظومة خطوة بخطوة.",
    challenge: "العروض التقنية المعقدة تفقد أثرها عندما تتحول إلى قائمة مزايا طويلة. كان التحدي هو جعل العميل يفهم النظام، التكاملات، القيمة التشغيلية، ومسار القرار دون أن يشعر أنه يقرأ وثيقة تقنية جامدة.",
    solution: "أُعيدت هندسة التجربة حول مفهوم Agent-Led Proposal: الوكيل يصبح مقدم العرض، يقود المستخدم بين المشاهد، يشرح أقسام CRM والتكاملات والنتائج، ويحوّل المعمارية التقنية إلى قصة قرار قابلة للفهم والمراجعة.",
    outcomes: ["تمييز واضح للعرض بدل Hero وصفحات تقليدية", "ربط وظائف CRM بالأثر التجاري والعمليات", "نموذج يمكن إعادة استخدامه لعروض B2B التقنية المعقدة"],
    tags: ["AI UX", "CRM", "Interactive Proposal"],
    stack: "Agent-led UX · CRM storytelling · Enterprise presentation",
    liveUrl: null,
    accent: "#31e6b5",
  },
];

const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function ensureStyles(html) {
  if (html.includes('/assets/css/positioning.css')) return html;
  return html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/positioning.css">\n</head>');
}

function caseCards() {
  return `<div class="case-study-grid">${cases.map((item) => `<article class="case-study-card reveal" style="--case-accent:${item.accent}"><small>${item.kicker}</small><h3>${item.title}</h3><p>${item.summary}</p><div class="case-study-tags">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div><a class="text-link" href="/work/${item.slug}/">دراسة الحالة <span aria-hidden="true">↗</span></a></article>`).join("")}</div>`;
}

function agentSpotlight() {
  const selected = [agents[2], agents[3], agents[4], agents[5], agents[8], agents[9]].filter(Boolean);
  return `<section class="home-agent-spotlight section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>BOWDY AGENTS</span><h2>مو مجرد أدوات AI. فريق وكلاء، وكل واحد ماسك مهمة.</h2><p>نصمم وكلاء أعمال عرب حول مهمة واضحة وبيانات موثوقة وصلاحيات محددة ومؤشر نجاح قابل للقياس. هذه هي الطبقة التي تميز باودي: ذكاء يعمل داخل النظام، لا بجانبه.</p></div><div class="home-agent-grid">${selected.map((agent) => `<article class="home-agent-card reveal" style="--agent-accent:${agent.accent}"><img src="/assets/media/agents/${agent.slug}-520.webp" width="92" height="92" loading="lazy" decoding="async" alt="${esc(agent.name)} — ${esc(agent.role)}"><div><small>${agent.code} · BOWDY AGENT</small><h3>${agent.name}</h3><p>${agent.role}</p></div><a href="/agents/#${agent.slug}" aria-label="تعرّف على ${esc(agent.name)}"></a></article>`).join("")}</div><div class="home-agent-actions"><a class="button" href="/agents/">قابل فريق وكلاء باودي <span aria-hidden="true">↗</span></a><a class="button button-ghost" href="/contact/?service=ai-agents">صمّم وكيلًا لمهمتك</a></div></div></section>`;
}

function injectAfterPlatform(html, content) {
  const start = html.indexOf('<section class="platform-section">');
  if (start < 0) throw new Error("Platform section not found on homepage.");
  const end = html.indexOf('</section>', start);
  if (end < 0) throw new Error("Platform section closing tag not found.");
  const insertAt = end + '</section>'.length;
  return html.slice(0, insertAt) + content + html.slice(insertAt);
}

function replaceWorkGrids(html) {
  const cards = caseCards();
  return html
    .replace(/<div class="work-grid">[\s\S]*?<\/div>\s*<div class="section-action">/, `${cards}<div class="section-action">`)
    .replace(/<div class="work-grid work-grid-page">[\s\S]*?<\/div>/, cards);
}

function replaceMeta(html, item) {
  const path = `/work/${item.slug}/`;
  const title = `${item.title} | ${site.nameEn}`;
  const description = item.summary;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${site.url}${path}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${site.url}${path}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}${path}#webpage`,
        url: `${site.url}${path}`,
        name: title,
        description,
        inLanguage: "ar-SA",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#organization` },
        dateModified: buildDate,
      },
      {
        "@type": "CreativeWork",
        "@id": `${site.url}${path}#case-study`,
        name: item.title,
        description,
        creator: { "@id": `${site.url}/#organization` },
        url: `${site.url}${path}`,
        keywords: item.tags.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${site.url}${path}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: "الأعمال", item: `${site.url}/work/` },
          { "@type": "ListItem", position: 3, name: item.title, item: `${site.url}${path}` },
        ],
      },
    ],
  };
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`);
}

function caseMain(item) {
  const liveAction = item.liveUrl ? `<a class="button button-ghost" href="${item.liveUrl}" target="_blank" rel="noopener">فتح المشروع المنشور <span aria-hidden="true">↗</span></a>` : "";
  return `<main id="main"><nav class="breadcrumbs container" aria-label="مسار التنقل"><ol><li><a href="/">الرئيسية</a></li><li><a href="/work/">الأعمال</a></li><li><span aria-current="page">${item.title}</span></li></ol></nav><section class="case-hero"><div class="container case-hero-grid"><div class="reveal"><span class="case-kicker">CASE STUDY · ${item.kicker}</span><h1>${item.title}</h1><p>${item.summary}</p><div class="hero-actions"><a class="button" href="/contact/">ناقش مشروعًا مشابهًا</a>${liveAction}</div></div><aside class="case-summary reveal"><article><small>نوع العمل</small><strong>${item.kicker}</strong></article><article><small>القدرات</small><strong>${item.tags.join(" · ")}</strong></article><article><small>المنظومة</small><strong>${item.stack}</strong></article></aside></div></section><section class="section-pad"><div class="container case-story"><article class="case-panel reveal"><span>01 · التحدي</span><h2>المشكلة قبل التصميم</h2><p>${item.challenge}</p></article><article class="case-panel reveal"><span>02 · الحل</span><h2>ما الذي بنيناه ولماذا؟</h2><p>${item.solution}</p></article></div></section><section class="section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>OUTCOMES</span><h2>الأثر الذي صُممت المنظومة لتحقيقه</h2><p>نعرض هنا نتائج تصميمية وتشغيلية قابلة للمراجعة، دون اختلاق أرقام أداء أو نسب تحويل غير موثقة.</p></div><div class="case-proof">${item.outcomes.map((outcome, index) => `<article class="reveal"><strong>0${index + 1}</strong><p>${outcome}</p></article>`).join("")}</div><p class="case-note">ملاحظة: أي أرقام أداء أو نتائج تجارية تُنشر فقط عندما تتوفر بيانات موثقة وموافقة مناسبة على استخدامها.</p></div></section><section class="section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>BUILD WHAT MATTERS</span><h2>عندك تحدٍ مشابه؟ نبدأ من النتيجة.</h2><p>أرسل الهدف والوضع الحالي وسنحوّل التفاصيل إلى نطاق واضح ومخرجات قابلة للمراجعة.</p></div><div class="case-nav"><a class="button" href="/contact/">ناقش مشروعك</a><a class="button button-ghost" href="/work/">كل دراسات الحالة</a></div></div></section></main>`;
}

let home = await readFile(join(dist, "index.html"), "utf8");
home = ensureStyles(home);
home = injectAfterPlatform(home, agentSpotlight());
home = replaceWorkGrids(home);
await writeFile(join(dist, "index.html"), home, "utf8");

let workPage = await readFile(join(dist, "work", "index.html"), "utf8");
workPage = ensureStyles(replaceWorkGrids(workPage));
await writeFile(join(dist, "work", "index.html"), workPage, "utf8");

for (const item of cases) {
  let html = ensureStyles(workPage);
  html = replaceMeta(html, item);
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, caseMain(item));
  const outputDir = join(dist, "work", item.slug);
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, "index.html"), html, "utf8");
}

const sitemapPath = join(dist, "sitemap.xml");
let sitemap = await readFile(sitemapPath, "utf8");
const additions = cases.filter((item) => !sitemap.includes(`${site.url}/work/${item.slug}/`)).map((item) => `  <url><loc>${site.url}/work/${item.slug}/</loc><lastmod>${buildDate}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join("\n");
if (additions) sitemap = sitemap.replace('</urlset>', `${additions}\n</urlset>`);
await writeFile(sitemapPath, sitemap, "utf8");

console.log(`Built ${cases.length} internal case studies and promoted BOWDY AGENTS on the homepage.`);
