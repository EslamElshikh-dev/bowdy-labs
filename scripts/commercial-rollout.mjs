import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { site, services } from "../src/content.mjs";
import { commercialDate, metadata } from "../src/commercial-content.mjs";
import { renderHome, renderPricing, renderServices, trialForm, commercialSchema, esc, serviceCopy } from "../src/commercial-pages.mjs";

const dist = new URL("../dist/", import.meta.url);
const read = file => readFile(new URL(file, dist), "utf8");
async function save(file, html) {
  const url = new URL(file, dist);
  await mkdir(new URL(".", url), { recursive: true });
  await writeFile(url, html);
}
const routeFor = (lang, kind) => `${lang === "en" ? "/en" : ""}/${kind === "home" ? "" : `${kind}/`}`;
const jsonScript = graph => `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script>`;

function pageFromShell(shell, lang, kind, main) {
  const route = routeFor(lang, kind);
  const url = site.url + route;
  const ar = site.url + routeFor("ar", kind);
  const en = site.url + routeFor("en", kind);
  const meta = metadata[lang][kind];
  let html = shell.replace(/<main\b[^>]*>[\s\S]*?<\/main>/, `<main id="main">${main}</main>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(meta.description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, "")
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(meta.ogTitle || meta.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(meta.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(meta.title)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(meta.ogTitle || meta.title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(meta.description)}">`)
    .replace(/<link rel="preload" as="image"[^>]*>/g, "")
    .replace(/(<a class="language-link" href=")[^"]*("[^>]*>)/g, `$1${routeFor(lang === "en" ? "ar" : "en", kind)}$2`);
  html = html.replace("</head>", `<link rel="alternate" hreflang="ar" href="${ar}"><link rel="alternate" hreflang="ar-SA" href="${ar}"><link rel="alternate" hreflang="en" href="${en}"><link rel="alternate" hreflang="en-SA" href="${en}"><link rel="alternate" hreflang="x-default" href="${ar}"><link rel="stylesheet" href="/assets/css/commercial.css?v=20261104-1"></head>`);
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_script, raw) => {
    const original = JSON.parse(raw)["@graph"];
    const keep = original.filter(node => ["#organization", "#website", "#local-business"].some(id => node["@id"] === site.url + "/" + id));
    for (const node of keep) {
      if (node["@type"] === "Organization" || Array.isArray(node["@type"])) node.description = metadata[lang].home.description;
    }
    const page = { "@type": kind === "home" ? "WebPage" : "CollectionPage", "@id": `${url}#webpage`, url, name: meta.title, description: meta.description, inLanguage: lang === "en" ? "en" : "ar-SA", isPartOf: { "@id": `${site.url}/#website` }, about: { "@id": `${site.url}/#organization` }, dateModified: commercialDate };
    const nodes = commercialSchema(lang, kind);
    if (kind === "services") {
      page.mainEntity = { "@id": `${url}#catalog` };
      const serviceNodes = services.map(service => ({
        "@type": "Service", "@id": `${url}#service-${service.slug}`,
        name: lang === "en" ? service.titleEn : service.title,
        url: lang === "en" ? `${url}#${service.slug}` : `${site.url}/services/${service.slug}/`,
        description: serviceCopy[service.slug][lang][0],
        provider: { "@id": `${site.url}/#organization` },
        areaServed: { "@type": "Country", name: "Saudi Arabia" },
      }));
      nodes.push(...serviceNodes, { "@type": "OfferCatalog", "@id": `${url}#catalog`, name: lang === "en" ? "Delivery capabilities" : "قدرات التنفيذ", itemListElement: serviceNodes.map(node => ({ "@type": "Offer", itemOffered: { "@id": node["@id"] } })) });
    }
    if (kind === "pricing") page.mainEntity = nodes.filter(node => node["@type"] === "Service").map(node => ({ "@id": node["@id"] }));
    return jsonScript([page, ...keep, ...nodes]);
  });
  return html;
}

// Run after legacy editorial/content passes, before performance and final credit passes.
// This keeps the commercial journey in one bilingual source instead of copying strings.
const shells = { ar: await read("index.html"), en: await read("en/index.html") };
for (const lang of ["ar", "en"]) {
  for (const [kind, render] of [["home", renderHome], ["pricing", renderPricing], ["services", renderServices]]) {
    const shell = kind === "services" ? await read(`${lang === "en" ? "en/" : ""}services/index.html`) : shells[lang];
    const html = pageFromShell(shell, lang, kind, render(lang));
    await save(`${routeFor(lang, kind).slice(1)}index.html`, html);
  }
  const contact = `${lang === "en" ? "en/" : ""}contact/index.html`;
  let html = await read(contact);
  html = html.replace(/(<main id="main">[\s\S]*?<\/section>)/, `$1${trialForm(lang)}`)
    .replace(/(<section\b[^>]*class="[^"]*\bcontact-section\b[^"]*")/, '$1 data-standard-contact')
    .replace("</head>", '<link rel="stylesheet" href="/assets/css/commercial.css?v=20261104-1"></head>')
    .replace("</body>", '<script defer src="/assets/js/trial.js?v=20261104-1"></script></body>');
  await save(contact, html);

  const platforms = `<section class="section-pad commercial-platforms"><div class="container"><h2>${lang === "en" ? "Tools selected around your requirements" : "منصات نختار منها حسب متطلباتك"}</h2><p>${lang === "en" ? "Technology choices do not imply formal partnerships. Hosting and model providers are agreed per project." : "ذكر هذه التقنيات لا يدل على شراكة رسمية. نحدد مزوّد الاستضافة والنموذج وفق نطاق كل مشروع."}</p><div>${["OpenAI", "NVIDIA", "AWS", "Google Cloud", "Vercel", "GitHub"].map(name => `<span>${name}</span>`).join("")}</div></div></section>`;
  const about = `${lang === "en" ? "en/" : ""}about/index.html`;
  await save(about, (await read(about)).replace("</main>", `${platforms}</main>`).replace("</head>", '<link rel="stylesheet" href="/assets/css/commercial.css?v=20261104-1"></head>'));

  const privacyText = lang === "en"
    ? [
      ["Trial requests and external channels", "The trial form prepares your name, phone, business WhatsApp and task description in your browser without persistent form storage or transmission to an AI provider. Opening the prepared WhatsApp link passes these details to WhatsApp/Meta; you then review and send the message. Closing the page clears the in-page form state; WhatsApp messages follow that platform’s retention rules and our enquiry-handling process. Do not include customer records, secrets or sensitive data."],
      ["Website assistant and model provider", "The website assistant sends its message and a short conversation context to the website API on Vercel. Generative processing is currently not configured; built-in replies remain available. If generative mode is enabled, the configured model provider is Cloudflare Workers AI. The interface keeps conversation text in page memory until refresh or closing, and an anonymous identifier in session storage for the browsing session. This is separate from a commissioned company agent."],
      ["Before a company-agent trial", "Before using real documents or conversations, we agree the model provider, storage and processing locations, retention period and deletion process in the trial scope. Evaluation starts with synthetic or de-identified data. There is no blanket promise of Saudi-only processing for the public website or its external channels; Saudi-hosted project requirements are assessed and documented separately. Contact info@bowdylabs.com for access or deletion requests."],
    ]
    : [
      ["طلبات التجربة وقنوات التواصل", "يجهّز نموذج التجربة الاسم والجوال وواتساب النشاط ووصف المهمة داخل متصفحك، دون حفظ دائم لحقول النموذج أو إرسالها إلى مزوّد ذكاء اصطناعي. فتح رابط واتساب المجهّز ينقل هذه التفاصيل إلى واتساب/Meta، ثم تراجع الرسالة وترسلها بنفسك. تزول حالة النموذج داخل الصفحة عند إغلاقها، وتخضع رسائل واتساب لسياسة احتفاظ المنصة وإجراءات متابعة الاستفسارات لدينا. لا تُدرج بيانات عملاء أو أسرارًا أو بيانات حساسة."],
      ["مساعد الموقع ومزوّد النموذج", "يرسل مساعد الموقع الرسالة وسياقًا قصيرًا للمحادثة إلى واجهة الموقع على Vercel. المعالجة التوليدية غير مهيأة حاليًا، وتتوفر ردود إرشادية مدمجة. عند تفعيل النمط التوليدي يكون المزوّد المهيأ في الكود Cloudflare Workers AI. تحتفظ الواجهة بنص المحادثة في ذاكرة الصفحة حتى تحديثها أو إغلاقها، وبمعرّف مجهول في تخزين الجلسة طوال جلسة التصفح. هذا منفصل عن وكيل شركة يُنفذ بمشروع خاص."],
      ["قبل تجربة وكيل الشركة", "قبل استخدام وثائق أو محادثات حقيقية، نحدد مزوّد النموذج ومواقع التخزين والمعالجة ومدة الاحتفاظ وآلية الحذف في نطاق التجربة. تبدأ التقييمات ببيانات مصطنعة أو منزوعة الهوية. لا يشمل الموقع العام وقنواته الخارجية وعدًا مطلقًا بالمعالجة داخل السعودية؛ تُقيّم متطلبات استضافة المشاريع داخل المملكة وتوثق بصورة مستقلة. لطلب الوصول أو الحذف تواصل عبر info@bowdylabs.com."],
    ];
  const termsText = lang === "en"
    ? [["Trials, pricing and cancellation", "The trial is free before any payment; its date is confirmed after reviewing the job and prerequisites. All published plan prices are in SAR including VAT. Monthly subscriptions may be cancelled with 30 days’ notice without a cancellation fee. Setup fees are non-refundable once implementation starts. Data and conversations are exported within the agreed scope. Paid Launch setup may be credited towards Build when upgrading within 90 days. Usage limits, overages, third-party charges and acceptance criteria are agreed in writing before implementation."], ["Hosting and readiness documentation", "Hosting, inference locations, data access and provider terms are specified per engagement. Readiness documentation helps assess applicable NCA and PDPL requirements; it is not regulator certification, legal accreditation or a guarantee of compliance or security. Third-party platform decisions, AI answers, ad performance and rankings are not guaranteed."]]
    : [["التجربة والأسعار والإلغاء", "التجربة مجانية قبل أي دفع، ويُؤكد موعدها بعد مراجعة المهمة والمتطلبات. أسعار الباقات المنشورة بالريال السعودي شاملة الضريبة. يُلغى الاشتراك الشهري بإشعار 30 يومًا بلا رسوم إلغاء. رسوم التأسيس لا تُسترد بعد بدء التنفيذ، ويكون تصدير البيانات والمحادثات ضمن النطاق المتفق عليه. تُخصم رسوم تأسيس انطلق المدفوعة من قيمة اشتغل عند الانتقال خلال 90 يومًا. تُحدد حدود الاستخدام والتجاوزات ورسوم الأطراف الخارجية ومعايير القبول كتابةً قبل التنفيذ."], ["الاستضافة ووثائق الجاهزية", "تُحدد الاستضافة ومواقع معالجة النموذج وصلاحيات البيانات وشروط المزوّدين لكل مشروع. تساعد وثائق الجاهزية في تقييم متطلبات NCA وPDPL المنطبقة؛ ولا تمثل شهادة من الجهة المنظمة أو اعتمادًا نظاميًا أو ضمان امتثال أو أمن شامل. لا نضمن قرارات المنصات الخارجية أو إجابات الذكاء الاصطناعي أو أداء الإعلان أو ترتيب البحث."]];
  for (const [kind, additions] of [["privacy", privacyText], ["terms", termsText]]) {
    const file = `${lang === "en" ? "en/" : ""}${kind}/index.html`;
    html = await read(file);
    const extra = `<div class="commercial-legal-additions">${additions.map(([h, p]) => `<section><h2>${h}</h2><p>${p}</p></section>`).join("")}</div>`;
    html = html.replace(/<p class="legal-updated">[^<]*<\/p>/, `${extra}<p class="legal-updated">${lang === "en" ? "Updated: 4 November 2026." : "آخر تحديث: 4 نوفمبر 2026."}</p>`);
    if (!html.includes("commercial-legal-additions")) html = html.replace("</main>", `<section class="section-pad"><div class="container article-body">${extra}</div></section></main>`);
    await save(file, html);
  }
}

async function htmlFiles(url = dist) {
  const entries = await readdir(url, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (entry.isDirectory()) result.push(...await htmlFiles(new URL(entry.name + "/", url)));
    else if (entry.name.endsWith(".html")) result.push(new URL(entry.name, url));
  }
  return result;
}

// Add Pricing immediately after Services on both desktop and mobile navigation.
for (const file of await htmlFiles()) {
  if (file.pathname.includes("/alarjancrm/")) continue;
  let html = await readFile(file, "utf8");
  const lang = html.includes('<html lang="en"') ? "en" : "ar";
  const pricingPath = routeFor(lang, "pricing");
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  html = html.replace(/<nav class="(?:desktop-nav|mobile-menu)"[\s\S]*?<\/nav>/g, nav => {
    let next = nav.replace(/(<a href="\/(?:en\/)?services\/"[^>]*>[^<]*<\/a>)/, `$1<a href="${pricingPath}">${lang === "en" ? "Pricing" : "الأسعار"}</a>`);
    if (canonical?.endsWith("/pricing/")) next = next.replace(/ aria-current="page"/g, "").replace(`href="${pricingPath}"`, `href="${pricingPath}" aria-current="page"`);
    return next;
  });
  html = html.replace(/src="\/assets\/js\/analytics\.js(?:\?[^"]*)?"/g, 'src="/assets/js/analytics.js?v=20261104-1"');
  await writeFile(file, html);
}

let sitemap = await read("sitemap.xml");
for (const lang of ["ar", "en"]) {
  const url = site.url + routeFor(lang, "pricing");
  if (!sitemap.includes(`<loc>${url}</loc>`)) sitemap = sitemap.replace("</urlset>", `<url><loc>${url}</loc><lastmod>${commercialDate}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>\n</urlset>`);
}
await save("sitemap.xml", sitemap);
console.log("Commercial rollout: bilingual home, pricing, services, trial intake, privacy, terms and navigation generated.");
