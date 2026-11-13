import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { site, services } from "../src/content.mjs";
import { serviceCopy } from "../src/commercial-pages.mjs";
import { businessSystems, systemsUi, systemsDate } from "../src/business-systems-content.mjs";
import { renderSystemPage, renderServicesHub, renderHomeSystems, esc } from "../src/business-systems-page.mjs";

const dist = new URL("../dist/", import.meta.url);
const read = path => readFile(new URL(path, dist), "utf8");
const save = async (path, html) => {
  const file = new URL(path, dist);
  await mkdir(new URL(".", file), { recursive: true });
  await writeFile(file, html);
};
const local = (lang, slug = "") => (lang === "en" ? "/en" : "") + "/services/" + (slug ? slug + "/" : "");
const schema = nodes => '<script type="application/ld+json">' + JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replaceAll("<", "\\u003c") + "</script>";
const addAssets = html => html.replace("</head>", '<link rel="stylesheet" href="/assets/css/business-systems.css?v=20261113-2"></head>').replace("</body>", '<script type="module" src="/assets/js/business-systems.js?v=20261113-2"></script></body>');
const graphOf = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];

function serviceNode(service, lang, url) {
  const copy = service[lang];
  return {
    "@type": "Service", "@id": url + "#service", url,
    name: copy ? copy.name : lang === "en" ? service.titleEn : service.title,
    description: copy ? copy.intro : serviceCopy[service.slug][lang][0],
    provider: { "@id": site.url + "/#organization" },
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
  };
}

function shellPage(shell, lang, service) {
  const hub = !service;
  const pagePath = local(lang, service?.slug), url = site.url + pagePath;
  const title = service?.[lang].title || (lang === "en" ? "CRM, Booking, Dashboards & AI Services | BOWDY LABS" : "أنظمة CRM والحجز ولوحات الإدارة والخدمات التقنية | باودي لابز");
  const description = service?.[lang].description || (lang === "en" ? "Independent CRM, dashboard, booking and chatbot services in Riyadh. Explore practical workflows, scope your first release and connect services when needed." : "خدمات مستقلة لأنظمة CRM ولوحات الإدارة والحجز والشات بوت في الرياض. جرّب مسارات توضيحية وحدد نطاقك الأول، مع خدمات باودي التقنية والأمنية.");
  let html = shell.replace(/<main\b[^>]*>[\s\S]*?<\/main>/, '<main id="main">' + (hub ? renderServicesHub(lang) : renderSystemPage(service, lang)) + "</main>");
  html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(title) + "</title>")
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + esc(description) + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">')
    .replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, "")
    .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + esc(title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + esc(description) + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + url + '">')
    .replace(/<meta property="og:image:alt" content="[^"]*">/, '<meta property="og:image:alt" content="' + esc(title) + '">')
    .replace(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="' + esc(title) + '">')
    .replace(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="' + esc(description) + '">')
    .replace(/<link rel="preload" as="image"[^>]*>/g, "")
    .replace(/(<a class="language-link" href=")[^"]*("[^>]*>)/g, "$1" + local(lang === "en" ? "ar" : "en", service?.slug) + "$2");
  const keep = graphOf(shell).filter(n => ["/#organization", "/#website", "/#local-business"].some(id => n["@id"] === site.url + id));
  const page = { "@type": hub ? "CollectionPage" : "WebPage", "@id": url + "#webpage", url, name: title, description, inLanguage: lang === "en" ? "en-SA" : "ar-SA", isPartOf: { "@id": site.url + "/#website" }, dateModified: systemsDate, mainEntity: { "@id": url + (hub ? "#catalog" : "#service") } };
  const nodes = [page, ...keep, { "@type": "BreadcrumbList", "@id": url + "#breadcrumbs", itemListElement: [
    { "@type": "ListItem", position: 1, name: lang === "en" ? "Home" : "الرئيسية", item: site.url + (lang === "en" ? "/en/" : "/") },
    { "@type": "ListItem", position: 2, name: lang === "en" ? "Services" : "الخدمات", item: site.url + local(lang) },
    ...(!hub ? [{ "@type": "ListItem", position: 3, name: service[lang].name, item: url }] : []),
  ] }];
  if (hub) {
    const entries = [...businessSystems, ...services].map(s => serviceNode(s, lang, site.url + local(lang, s.slug)));
    nodes.push(...entries, { "@type": "OfferCatalog", "@id": url + "#catalog", name: lang === "en" ? "BOWDY services" : "خدمات باودي", itemListElement: entries.map(n => ({ "@type": "Offer", itemOffered: { "@id": n["@id"] } })) });
  } else {
    nodes.push(serviceNode(service, lang, url), { "@type": "FAQPage", "@id": url + "#faq", mainEntity: service[lang].faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) });
  }
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
  const ar = site.url + local("ar", service?.slug), en = site.url + local("en", service?.slug);
  const alternates = [["ar", ar], ["ar-SA", ar], ["en", en], ["en-SA", en], ["x-default", ar]].map(([language, href]) => '<link rel="alternate" hreflang="' + language + '" href="' + href + '">').join("");
  html = html.replace("</head>", alternates + schema(nodes) + "</head>");
  return addAssets(html);
}

for (const lang of ["ar", "en"]) {
  const prefix = lang === "en" ? "en/" : "";
  const shell = await read(prefix + "services/web-development/index.html");
  await save(prefix + "services/index.html", shellPage(shell, lang));
  for (const service of businessSystems) await save(prefix + "services/" + service.slug + "/index.html", shellPage(shell, lang, service));
  let home = await read(prefix + "index.html");
  const marker = '<section class="section-pad positioning-section" id="governance">';
  if (!home.includes(marker)) throw new Error("Governance insertion marker missing: " + lang);
  home = home.replace(marker, renderHomeSystems(lang) + marker).replace("</head>", '<link rel="stylesheet" href="/assets/css/business-systems.css?v=20261113-2"></head>');
  await save(prefix + "index.html", home);
  let contact = await read(prefix + "contact/index.html");
  const options = businessSystems.map(s => '<option value="' + s.slug + '">' + esc(s[lang].name) + "</option>").join("");
  contact = contact.replace(/(<select\b[^>]*name="service"[^>]*>)([\s\S]*?)(<\/select>)/, "$1$2" + options + "$3")
    .replace(/<form\b[^>]*\bdata-contact-form(?:-en)?[^>]*>/, opening => opening.replace(">", ' id="project-brief">'))
    .replace("Review brief in WhatsApp ↗", 'Review brief in WhatsApp <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>')
    .replace("</body>", '<script type="application/json" data-contact-plan-copy>' + JSON.stringify(systemsUi[lang]).replaceAll("<", "\\u003c") + "</script></body>");
  await save(prefix + "contact/index.html", addAssets(contact));
  const privacyPath = prefix + "privacy/index.html";
  let privacy = await read(privacyPath);
  const privacySection = lang === "en"
    ? "<section><h2>Business-system examples and planning choices</h2><p>The interactive CRM, booking, dashboard and chatbot examples use synthetic data and run locally in your browser. They do not create real requests or appointments or send example conversations to an AI provider. The scope planner can download a text brief locally. Its non-personal service, current-tool and approval choices can be carried to the contact page in the URL. You can edit the brief before preparing and sending your message in WhatsApp. Interaction analytics use predefined service and action categories, without brief text or personal contact information.</p></section>"
    : "<section><h2>نماذج أنظمة الأعمال واختيارات النطاق</h2><p>تستخدم نماذج CRM والحجز واللوحات والشات بوت بيانات تجريبية، وتعمل محليًا داخل متصفحك. لا تنشئ طلبات أو حجوزات حقيقية، ولا ترسل محادثات النموذج إلى مزوّد ذكاء اصطناعي. يمكن تنزيل ملخص النطاق كملف نصي محلي. وقد تنتقل اختيارات الخدمة والأدوات والموافقة غير الشخصية إلى صفحة التواصل داخل الرابط. تستطيع تعديل الملخص قبل تجهيز الرسالة وإرسالها بنفسك في واتساب. يستخدم قياس التفاعل تصنيفات محددة للخدمة والإجراء دون نص الملخص أو معلومات الاتصال الشخصية.</p></section>";
  privacy = privacy.replace('<div class="commercial-legal-additions">', '<div class="commercial-legal-additions">' + privacySection);
  await save(privacyPath, privacy);
}

let sitemap = await read("sitemap.xml");
const newEntries = ["ar", "en"].flatMap(lang => businessSystems.map(s => "<url><loc>" + site.url + local(lang, s.slug) + "</loc><lastmod>" + systemsDate + "</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>")).join("\n");
sitemap = sitemap.replace("</urlset>", newEntries + "\n</urlset>");
await save("sitemap.xml", sitemap);

async function refreshScripts(dir = dist) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
    if (entry.isDirectory()) await refreshScripts(file);
    else if (entry.name.endsWith(".html")) {
      let html = await readFile(file, "utf8");
      html = html.replace(/src="\/assets\/js\/main\.js(?:\?[^"]*)?"/g, 'src="/assets/js/main.js?v=20261113-systems1"')
        .replace(/src="\/assets\/js\/contact-en\.js(?:\?[^"]*)?"/g, 'src="/assets/js/contact-en.js?v=20261113-systems1"');
      await writeFile(file, html);
    }
  }
}
await refreshScripts();
console.log("Built eight bilingual business-system pages, a service hub, homepage discovery and scoped contact handoff.");
