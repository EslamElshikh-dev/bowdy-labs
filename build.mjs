import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { minify } from "terser";
import { agents } from "./src/agents.mjs";
import { agentsPageModel } from "./src/agents-page.mjs";
import { alarganCrmPage } from "./src/alargan-crm.mjs";
import {
  insights,
  services,
  servicesShowcase,
  site,
  technologyIcons,
  work,
} from "./src/content.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const year = 2026;
const googleSiteVerification = "RhoDv6mIF2DsPd84eCLRiv9HGlPI-viiXPcJIJGafDM";

const esc = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const icons = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  automation: '<path d="M4 8h11M4 16h16"/><circle cx="18" cy="8" r="2"/><circle cx="7" cy="16" r="2"/>',
  api: '<path d="M8 9 4 12l4 3M16 9l4 3-4 3M14 5l-4 14"/>',
  brain: '<path d="M9.5 4.5A3 3 0 0 0 4 6v1.2A3.5 3.5 0 0 0 3 13v.5A3.5 3.5 0 0 0 6.5 17H9V5.5a2 2 0 0 1 .5-1ZM14.5 4.5A3 3 0 0 1 20 6v1.2a3.5 3.5 0 0 1 1 5.8v.5a3.5 3.5 0 0 1-3.5 3.5H15V5.5a2 2 0 0 0-.5-1ZM9 9H6.5M15 9h2.5M9 14H7M15 14h2"/>',
  chart: '<path d="M4 19V5M4 19h16M7 15l4-4 3 2 5-7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.08 8.5 4.8 4.8 0 0 0 7 18Z"/>',
  code: '<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
  database: '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  external: '<path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  nodes: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="17" r="2"/><path d="m10.8 6.6-4.6 8.6M13.2 6.6l4.6 8.6M7 17h10"/>',
  phone: '<path d="M7 3 4 5c-.8.6-.6 2.5.4 4.8 1.8 4.2 5.6 8 9.8 9.8 2.3 1 4.2 1.2 4.8.4l2-3-5-3-2 2c-1.8-.8-5.2-4.2-6-6l2-2-3-5Z"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.8 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.7 7.5-9.5V6L12 3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  spark: '<path d="m12 3 1.2 4.3L17.5 9l-4.3 1.7L12 15l-1.2-4.3L6.5 9l4.3-1.7L12 3ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
  store: '<path d="M4 9h16l-1-5H5L4 9Z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/><path d="M4 9c0 1.5 1.1 2.5 2.5 2.5S9 10.5 9 9c0 1.5 1.1 2.5 2.5 2.5S14 10.5 14 9c0 1.5 1.1 2.5 2.5 2.5S19 10.5 19 9"/>',
  mobile: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4M11 18.5h2"/>',
  vision: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8.2 7.8c.4 3.8 3 6.3 6.8 6.8l1.2-1.8-2.4-1.1-1 1c-1.3-.6-2.4-1.7-3-3l1-1-1.1-2.4-1.5 1.5Z"/>',
};

function icon(name, className = "icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name] ?? icons.spark}</svg>`;
}

function logo(className = "brand-mark") {
  return `<img class="${className}" src="${site.logo}" width="72" height="72" alt="">`;
}

function wordmark({ compact = false, english = false } = {}) {
  return `<span class="wordmark${compact ? " wordmark-compact" : ""}">
    <strong lang="en" dir="ltr">${site.brandName}</strong>
    <small>${english ? site.taglineEn : site.nameAr}</small>
  </span>`;
}

function brandLink({ footer = false, english = false } = {}) {
  return `<a class="brand-link${footer ? " brand-link-footer" : ""}" href="${english ? "/en/" : "/"}" aria-label="${english ? "BOWDY LABS home" : "باودي لابز — الرئيسية"}">${logo()}${wordmark({ english })}</a>`;
}

function header(active = "", language = "ar") {
  const english = language === "en";
  const items = english
    ? [
        ["home", "/en/", "Home"],
        ["services", "/services/", "Services"],
        ["agents", "/en/agents/", "AI Agents"],
        ["work", "/work/", "Work"],
        ["about", "/about/", "About"],
        ["insights", "/insights/", "Insights"],
      ]
    : [
        ["home", "/", "الرئيسية"],
        ["services", "/services/", "الخدمات"],
        ["agents", "/agents/", "وكلاء AI"],
        ["work", "/work/", "الأعمال"],
        ["about", "/about/", "عن باودي"],
        ["insights", "/insights/", "مدونتنا"],
      ];
  const links = items
    .map(([key, href, label]) => `<a href="${href}"${key === active ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("");
  return `
  <a class="skip-link" href="#main">${english ? "Skip to content" : "انتقل إلى المحتوى"}</a>
  <header class="site-header" data-header>
    <div class="container header-inner">
      ${brandLink({ english })}
      <nav class="desktop-nav" aria-label="${english ? "Main navigation" : "التنقل الرئيسي"}">${links}</nav>
      <div class="header-actions">
        <a class="language-link" href="${english ? "/" : "/en/"}" lang="${english ? "ar" : "en"}">${english ? "عربي" : "EN"}</a>
        <a class="button button-small header-cta" href="/contact/">${english ? "Start a project" : "ابدأ مشروعك"} ${icon("arrow", "button-icon")}</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="${english ? "Open menu" : "فتح القائمة"}" data-menu-toggle>
          <span data-menu-open>${icon("menu")}</span><span data-menu-close>${icon("close")}</span>
        </button>
      </div>
    </div>
    <nav class="mobile-menu" id="mobile-menu" aria-label="${english ? "Mobile navigation" : "قائمة الجوال"}" data-mobile-menu>
      ${links}<a class="language-link" href="${english ? "/" : "/en/"}">${english ? "العربية" : "English"}</a>
      <a class="button" href="/contact/">${english ? "Start a project" : "ابدأ مشروعك"}</a>
    </nav>
  </header>`;
}

function footer(language = "ar") {
  const english = language === "en";
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        ${brandLink({ footer: true, english })}
        <p>${english ? "Secure AI, software and digital growth systems built around measurable business outcomes." : "نبني حلول ذكاء اصطناعي وبرمجيات وأنظمة نمو رقمية آمنة حول نتيجة تجارية قابلة للقياس."}</p>
        <span class="footer-tagline" lang="en" dir="ltr">${site.taglineEn}</span>
      </div>
      <div><h2>${english ? "Explore" : "استكشف"}</h2><a href="/services/">${english ? "Services" : "الخدمات"}</a><a href="${english ? "/en/agents/" : "/agents/"}">${english ? "AI agents" : "وكلاء باودي"}</a><a href="/work/">${english ? "Selected work" : "الأعمال"}</a><a href="/about/">${english ? "About the lab" : "عن باودي لابز"}</a><a href="/insights/">${english ? "Insights" : "مدونتنا"}</a></div>
      <div class="footer-services"><h2>${english ? "Capabilities" : "المسارات"}</h2>${services.slice(0, 6).map((service) => `<a href="/services/${service.slug}/">${english ? service.titleEn : service.title}</a>`).join("")}</div>
      <div class="footer-contact"><h2>${english ? "Contact" : "تواصل"}</h2><a href="tel:${site.phone}" dir="ltr">${icon("phone")}${site.phoneDisplay}</a><a href="${site.whatsapp}" target="_blank" rel="noopener">${icon("whatsapp")}WhatsApp</a><a href="mailto:${site.email}">${icon("mail")}<span>${site.email}</span></a><span>${icon("pin")}<span>${english ? "Riyadh, Saudi Arabia" : `${site.city}، ${site.country}`}</span></span></div>
    </div>
    <div class="container footer-bottom"><p>© ${year} ${site.nameEn}. ${english ? "All rights reserved." : "جميع الحقوق محفوظة."}</p><div><a href="/privacy/">${english ? "Privacy" : "الخصوصية"}</a><a href="/terms/">${english ? "Terms" : "الشروط"}</a><a href="/.well-known/security.txt">${english ? "Security" : "الإبلاغ الأمني"}</a></div></div>
  </footer>
  <div class="floating-actions" aria-label="${english ? "Quick contact" : "تواصل سريع"}">
    <a class="floating-call" href="tel:${site.phone}" aria-label="${english ? "Call BOWDY LABS" : "اتصل بباودي لابز"}">${icon("phone")}<span class="floating-action-label">${english ? "Call us" : "اتصل بنا"}</span></a>
    <a class="floating-whatsapp" href="${site.whatsapp}?text=${encodeURIComponent(english ? "Hello BOWDY LABS, I would like to discuss a technology project." : "مرحبًا باودي لابز، أريد مناقشة مشروع تقني.")}" target="_blank" rel="noopener" aria-label="${english ? "Contact BOWDY LABS on WhatsApp" : "تواصل مع باودي لابز عبر واتساب"}">${icon("whatsapp")}<span class="floating-action-label">${english ? "WhatsApp" : "تواصل عبر واتساب"}</span></a>
  </div>
  <nav class="mobile-bottom-nav" aria-label="${english ? "Quick navigation" : "تنقل سريع للجوال"}">
    <a href="${english ? "/en/" : "/"}">${icon("home")}<span>${english ? "Home" : "الرئيسية"}</span></a>
    <a href="/services/">${icon("spark")}<span>${english ? "Services" : "الخدمات"}</span></a>
    <a href="/work/">${icon("vision")}<span>${english ? "Work" : "الأعمال"}</span></a>
    <a href="/contact/">${icon("mail")}<span>${english ? "Contact" : "تواصل"}</span></a>
  </nav>`;
}

const organizationSchema = {
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.nameEn,
  alternateName: site.nameAr,
  url: site.url,
  logo: `${site.url}${site.logo}`,
  image: `${site.url}${site.shareImage}`,
  slogan: site.taglineEn,
  description: site.description,
  email: site.email,
  telephone: site.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.city,
    addressRegion: "منطقة الرياض",
    addressCountry: "SA",
  },
  areaServed: [
    { "@type": "Country", name: site.country },
    { "@type": "AdministrativeArea", name: "الشرق الأوسط" },
  ],
  knowsAbout: services.map((service) => service.titleEn),
};

const websiteSchema = {
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: site.nameEn,
  alternateName: site.nameAr,
  inLanguage: ["ar-SA", "en"],
  publisher: { "@id": `${site.url}/#organization` },
};

const professionalServiceSchema = {
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": `${site.url}/#local-business`,
  name: `${site.nameAr} للحلول التقنية والذكاء الاصطناعي`,
  alternateName: `${site.nameEn} Technology & AI`,
  url: site.url,
  image: `${site.url}${site.shareImage}`,
  logo: `${site.url}${site.logo}`,
  email: site.email,
  telephone: site.phone,
  parentOrganization: { "@id": `${site.url}/#organization` },
  address: {
    "@type": "PostalAddress",
    addressLocality: site.city,
    addressRegion: "منطقة الرياض",
    addressCountry: "SA",
  },
  areaServed: { "@type": "Country", name: site.country },
  knowsAbout: servicesShowcase.map((service) => service.title),
  priceRange: "$$",
};

function schemaScript(nodes) {
  const unique = new Map();
  nodes.filter(Boolean).forEach((node) => unique.set(node["@id"] ?? `${node["@type"]}-${node.name ?? ""}`, node));
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [...unique.values()] }).replaceAll("<", "\\u003c")}</script>`;
}

function layout({
  title,
  description,
  path = "/",
  active = "",
  body,
  language = "ar",
  type = "website",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  schema = [],
  preloadHero = false,
  mainEntity = null,
  alternatePath = null,
}) {
  const english = language === "en";
  const canonical = `${site.url}${path}`;
  const pageTitle = path === "/" || path === "/en/" ? title : `${title} | ${site.nameEn}`;
  const pageSchema = {
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: pageTitle,
    description,
    inLanguage: english ? "en" : "ar-SA",
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@id": `${site.url}/#organization` },
    ...(mainEntity ? { mainEntity } : {}),
    dateModified: "2026-08-16",
  };
  const alternate = path === "/" || path === "/en/";
  const alternateLinks = alternatePath
    ? `<link rel="alternate" hreflang="ar" href="${site.url}${alternatePath.ar}"><link rel="alternate" hreflang="ar-SA" href="${site.url}${alternatePath.ar}"><link rel="alternate" hreflang="en" href="${site.url}${alternatePath.en}"><link rel="alternate" hreflang="x-default" href="${site.url}${alternatePath.ar}">`
    : alternate
      ? `<link rel="alternate" hreflang="ar" href="${site.url}/"><link rel="alternate" hreflang="ar-SA" href="${site.url}/"><link rel="alternate" hreflang="en" href="${site.url}/en/"><link rel="alternate" hreflang="x-default" href="${site.url}/">`
      : `<link rel="alternate" hreflang="ar" href="${canonical}"><link rel="alternate" hreflang="ar-SA" href="${canonical}"><link rel="alternate" hreflang="x-default" href="${canonical}">`;
  return `<!doctype html>
<html lang="${english ? "en" : "ar"}" dir="${english ? "ltr" : "rtl"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="google-site-verification" content="${googleSiteVerification}">
  <meta name="robots" content="${robots}">
  <meta name="author" content="${site.nameEn}">
  <meta name="application-name" content="${site.nameEn}">
  <meta name="theme-color" content="#050815">
  <meta name="color-scheme" content="dark">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="geo.region" content="SA-01">
  <meta name="geo.placename" content="${english ? "Riyadh" : site.city}">
  <link rel="canonical" href="${canonical}">
  ${alternateLinks}
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="preload" href="/assets/fonts/ibm-plex-arabic-700.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/sora-600.woff2" as="font" type="font/woff2" crossorigin>
  ${preloadHero ? `<link rel="preload" as="image" href="${site.heroImageMedium}" imagesrcset="${site.heroImageSmall} 760w, ${site.heroImageMedium} 1200w, ${site.heroImage} 1717w" imagesizes="(max-width: 900px) calc(100vw - 24px), 54vw" type="image/webp">` : ""}
  <meta property="og:locale" content="${english ? "en_US" : "ar_SA"}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${site.nameEn}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site.url}${site.shareImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(pageTitle)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${site.url}${site.shareImage}">
  <link rel="stylesheet" href="/assets/css/main.css">
  <noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>
  ${schemaScript([pageSchema, organizationSchema, websiteSchema, professionalServiceSchema, ...schema])}
</head>
<body>
  <div class="ambient ambient-one" aria-hidden="true"></div><div class="ambient ambient-two" aria-hidden="true"></div>
  ${header(active, language)}
  <main id="main">${body}</main>
  ${footer(language)}
  <script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

function eyebrow(text) {
  return `<span class="eyebrow"><i aria-hidden="true"></i>${text}</span>`;
}

function sectionHead(kicker, title, description = "") {
  return `<div class="section-head reveal">${eyebrow(kicker)}<h2>${title}</h2>${description ? `<p>${description}</p>` : ""}</div>`;
}

const serviceGroupEnglish = {
  "الأمن والبنية السحابية": "Security & Cloud",
  "الذكاء الاصطناعي والبرمجيات": "AI & Software",
  "منظومة Google": "Google Ecosystem",
  "النمو والبحث الذكي": "Growth & Intelligent Search",
};

function serviceCard(service, english = false) {
  return `<article class="service-card reveal" data-service-group="${service.group}">
    <div class="service-top"><span>${service.number}</span><span class="service-icon">${icon(service.icon)}</span></div>
    <small>${english ? serviceGroupEnglish[service.group] : service.group}</small>
    <h3><a href="/services/${service.slug}/">${english ? service.titleEn : service.title}</a></h3>
    <p>${english ? service.shortEn : service.short}</p>
    <a class="text-link" href="/services/${service.slug}/">${english ? "Explore capability" : "تفاصيل المسار"} ${icon("arrow")}</a>
  </article>`;
}

function aiShowcaseCard(service) {
  const headingId = `${service.id}-title`;
  return `<article class="ai-service-card reveal" id="${service.id}" aria-labelledby="${headingId}" data-tilt-card>
    <span class="ai-card-glow" aria-hidden="true"></span>
    <div class="ai-card-top"><span>${service.number}</span><span class="ai-service-icon">${icon(service.icon)}</span></div>
    <small>${service.titleEn}</small>
    <h3 id="${headingId}">${service.title}</h3>
    <p>${service.description}</p>
    <div class="ai-service-tags" dir="ltr">${service.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
    <a class="text-link" href="/contact/?service=${service.contactService}">ناقش الحل مع فريقنا ${icon("arrow")}</a>
  </article>`;
}

function essentialShowcaseCard(service) {
  const headingId = `${service.id}-title`;
  return `<article class="essential-service-card reveal" id="${service.id}" aria-labelledby="${headingId}">
    <div class="service-top"><span>${service.number}</span><span class="service-icon">${icon(service.icon)}</span></div>
    <small>${service.titleEn}</small>
    <h3 id="${headingId}">${service.title}</h3>
    <p>${service.description}</p>
    <a class="text-link" href="/contact/?service=${service.contactService}">اطلب هذه الخدمة ${icon("arrow")}</a>
  </article>`;
}

function breadcrumbs(items, language = "ar") {
  return `<nav class="breadcrumbs container" aria-label="${language === "en" ? "Breadcrumb" : "مسار التنقل"}"><ol>${items
    .map(([label, href], index) => `<li>${href && index < items.length - 1 ? `<a href="${href}">${label}</a>` : `<span aria-current="page">${label}</span>`}</li>`)
    .join("")}</ol></nav>`;
}

function pageHero(kicker, title, description, actions = "") {
  return `<section class="page-hero section-pad"><div class="container page-hero-grid">
    <div class="reveal">${eyebrow(kicker)}<h1>${title}</h1><p>${description}</p>${actions}</div>
    <div class="page-hero-symbol reveal" aria-hidden="true"><span></span>${logo("page-hero-logo")}</div>
  </div></section>`;
}

function ctaSection({
  title = "لنحوّل التحدي إلى نظام يعمل",
  description = "أرسل الهدف والوضع الحالي والموعد المتوقع. سنقترح نقطة بداية ونطاقًا قابلًا للمراجعة والقياس.",
  english = false,
} = {}) {
  return `<section class="cta-section section-pad"><div class="container cta-panel reveal">
    <div>${eyebrow(english ? "Build what matters" : "ابدأ من النتيجة")}<h2>${english ? "Turn complexity into a system that delivers" : title}</h2><p>${english ? "Share the goal, current state and target timeline. We will propose a focused starting point." : description}</p></div>
    <a class="button" href="/contact/">${english ? "Discuss your project" : "ناقش مشروعك"} ${icon("arrow", "button-icon")}</a>
  </div></section>`;
}

function platformStrip(english = false) {
  const platforms = ["OpenAI", "NVIDIA", "AWS", "Google Cloud", "Vercel", "GitHub"];
  return `<section class="platform-section"><div class="container">
    <p>${english ? "Technologies and platforms selected to fit each project — no partnership implied" : "تقنيات ومنصات نختار منها بحسب احتياج المشروع — دون دلالة على شراكة رسمية"}</p>
    <div class="platform-row" dir="ltr">${platforms.map((platform) => `<span>${platform}</span>`).join("")}</div>
  </div></section>`;
}

function workCard(item) {
  return `<article class="work-card reveal"><div class="work-visual"><span>${item.category}</span><i></i><i></i><i></i></div><div class="work-copy"><h3>${item.title}</h3><p>${item.description}</p><div class="tags">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div><a class="text-link" href="${item.url}" target="_blank" rel="noopener">معاينة المشروع ${icon("external")}</a></div></article>`;
}

function insightCard(item) {
  const service = services.find((candidate) => candidate.slug === item.service);
  return `<article class="insight-card reveal"><a class="insight-art" href="/insights/${item.slug}/">${icon(service?.icon ?? "spark", "insight-icon")}<span>${item.category}</span></a><small>${item.readTime}</small><h3><a href="/insights/${item.slug}/">${item.title}</a></h3><p>${item.excerpt}</p><a class="text-link" href="/insights/${item.slug}/">اقرأ الرؤية ${icon("arrow")}</a></article>`;
}

function homePage() {
  const aiHomepageServices = servicesShowcase.filter((service) => service.featured);
  const essentialHomepageServices = servicesShowcase.filter((service) => !service.featured);
  const faq = [
    ["ما نوع المشروعات التي تنفذها باودي لابز؟", "نبني ونطوّر مشروعات الأمن السيبراني والبنية السحابية ووكلاء الذكاء الاصطناعي والمواقع والتطبيقات ومنظومة Google وتحسين محركات البحث والإعلانات الرقمية. ويمكن تنفيذ مسار مستقل أو جمع أكثر من تخصص داخل حل واحد عندما تكون النتيجة مترابطة."],
    ["هل يمكن جمع أكثر من خدمة في مشروع واحد؟", "نعم. يمكن مثلًا تصميم منصة آمنة، وربطها بقاعدة معرفة ووكيل ذكي، ثم تجهيز صفحاتها للفهرسة وربط القياس والحملات. نحدد مسؤولية كل طبقة حتى يبقى الحل قابلًا للتشغيل والتطوير بدل أن يصبح مجموعة أدوات منفصلة."],
    ["كيف يبدأ التعاون؟", "نبدأ بجلسة تشخيص للهدف والوضع الحالي والمستخدمين والبيانات والقيود والمخاطر. بعد ذلك نقترح نطاقًا واضحًا ومخرجات ومعايير قبول ومراحل زمنية، ولا يبدأ التنفيذ قبل اتفاق الطرفين على ما يدخل في المشروع وما يبقى خارجه."],
    ["هل تعملون داخل السعودية فقط؟", "تنطلق باودي لابز من الرياض وتقدم معظم خدماتها الرقمية عن بُعد للشركات داخل السعودية وخارجها. أما الزيارات الميدانية أو المتطلبات المرتبطة بموقع فعلي فتُحدّد بحسب طبيعة المشروع ونطاقه."],
    ["هل تناسب الخدمات الشركات الصغيرة والمشروعات الناشئة؟", "نعم عندما تكون المشكلة محددة والقيمة المتوقعة واضحة. لا نفرض بنية ضخمة على مشروع صغير؛ بل نختار نقطة بداية عملية يمكن اختبارها ثم توسيعها عند ثبوت الحاجة."],
    ["كيف تحافظون على الأمان والخصوصية أثناء المشروع؟", "نطلب أقل قدر لازم من البيانات، ونحدد الصلاحيات وقنوات المشاركة، ولا نطلب كلمات مرور أو رموز تحقق عبر الموقع. وفي المشروعات الحساسة نضيف ضوابط توثيق ووصول واحتفاظ تتناسب مع المخاطر الفعلية."],
  ];
  const faqSchema = {
    "@type": "FAQPage",
    "@id": `${site.url}/#faq`,
    mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return layout({
    title: `${site.nameEn} | شركة ذكاء اصطناعي وحلول تقنية في الرياض`,
    description: site.description,
    active: "home",
    schema: [faqSchema],
    preloadHero: true,
    body: `
    <section class="hero section-pad">
      <div class="container hero-grid">
        <div class="hero-copy reveal">
          ${eyebrow("شركة تكنولوجيا وذكاء اصطناعي من الرياض")}
          <p class="hero-kicker" lang="en" dir="ltr">${site.taglineEn}</p>
          <h1>حلول ذكاء اصطناعي <span>تفكّر للمستقبل</span> وتصنع أثرًا اليوم</h1>
          <p class="hero-lead">نحوّل تحديات العمل إلى أنظمة رقمية آمنة وقابلة للتوسع، تجمع الذكاء الاصطناعي والبرمجيات والسحابة والأمن ومنظومة Google والنمو الرقمي ضمن رحلة تنفيذ واضحة ومؤشرات نجاح قابلة للقياس.</p>
          <div class="hero-actions"><a class="button" href="/contact/">ناقش مشروعك ${icon("arrow", "button-icon")}</a><a class="button button-ghost" href="/services/">استكشف قدراتنا</a></div>
          <div class="hero-proof"><span>${icon("shield")}Secure by design</span><span>${icon("nodes")}Human-governed AI</span><span>${icon("chart")}Measurable impact</span></div>
        </div>
        <div class="hero-visual reveal">
          <div class="hero-image-shell"><img src="${site.heroImageMedium}" srcset="${site.heroImageSmall} 760w, ${site.heroImageMedium} 1200w, ${site.heroImage} 1717w" sizes="(max-width: 900px) calc(100vw - 24px), 54vw" width="1717" height="916" alt="شعار باودي لابز الرسمي بتكوين شبكي مضيء يرمز إلى الذكاء الاصطناعي" fetchpriority="high" decoding="async"><span class="scan-line" aria-hidden="true"></span></div>
          <div class="hero-data-card hero-data-one"><small>AI DEVELOPMENT</small><strong>Ready</strong><i></i></div>
          <div class="hero-data-card hero-data-two"><small>SECURITY</small><strong>By design</strong></div>
          <div class="hero-orbit" aria-hidden="true"><span>AI</span><span>Cloud</span><span>Secure</span></div>
        </div>
      </div>
      <div class="container value-metrics reveal" aria-label="مزايا باودي لابز">
        <article class="value-card"><span class="value-check">${icon("check")}</span><div><strong>شركة سعودية</strong><p>ولأننا أصحاب الجذور، نفهم السوق ونحلل الأداء ثم نبني استراتيجيات تتخطى آفاق النجاح.</p></div></article>
        <article class="value-card"><span class="value-check">${icon("check")}</span><div><strong>ذكاء اصطناعي يتكلم عربي</strong><p>نماذج ذكاء اصطناعي بُنيت بلسان عربي لتفهم ما بين السطور، ولتعيش وتتفاعل باللغة العربية.</p></div></article>
        <article class="value-card"><span class="value-check">${icon("check")}</span><div><strong>خبرة تتجاوز الأرقام</strong><p>تاريخنا نكتبه بنجاحك: سيبك من لغة الأرقام، نحن نقيس خبرتنا بحجم نمو أعمالك.</p></div></article>
        <article class="value-card"><span class="value-check">${icon("check")}</span><div><strong>ضمان على كافة أعمالنا</strong><p>كلمتنا عهد، وأعمالنا مضمونة: سلّمنا المهمة، واستمتع بنتيجة مضمونة 100٪ تدعم طموحك.</p></div></article>
      </div>
    </section>
    ${platformStrip()}
    <section class="section-pad positioning-section"><div class="container positioning-grid">
      <div class="positioning-copy reveal">${eyebrow("نوحد هندسة الأعمال مع عبقرية التنفيذ")}<h2>نسبق الواقع بحلول مستقبلية مبنية على رؤية سعودية واعدة</h2><p>الكثير من المشاريع تدفع ضريبة التخبط؛ حين تُبنى الاستراتيجيات بمعزل عن كود التطوير، أو تُصمم الواجهات بتجاهل تام للأداء والفهرسة، أو تُدمج أدوات الذكاء الاصطناعي دون بنية تحتية تحمي البيانات وتضبط الصلاحيات.</p><p>نحن في باودي لابز نعيد صياغة هذه المعادلة. نجمع كل خيوط اللعبة التقنية في خطة محكمة، تبدأ دائمًا من الهدف التجاري لنشاطك.</p><p>شراكتنا مع قطاع الأعمال في الرياض ومختلف مناطق المملكة تقوم على الوضوح المطلق والنطاق المحدد. قبل كتابة سطر برمجي واحد، نتفق على ما سيتم بناؤه، وآليات اختباره، وأصحاب القرار، والمؤشرات الحاسمة التي تضمن أن التقنية قد صنعت فرقًا فعليًا في أعمالك.</p></div>
      <div class="positioning-points">
        <article class="reveal"><span>${icon("nodes")}</span><div><h3>صورة واحدة للمشروع</h3><p>البيانات والتجربة والأمان والبنية والنمو تُصمم كوحدة مترابطة بدل قرارات متضاربة.</p></div></article>
        <article class="reveal"><span>${icon("shield")}</span><div><h3>أمان منذ التصميم</h3><p>نراجع حدود الثقة والصلاحيات والأسرار والتعافي قبل أن تصبح إضافتها مكلفة بعد الإطلاق.</p></div></article>
        <article class="reveal"><span>${icon("chart")}</span><div><h3>تنفيذ قابل للقياس</h3><p>لكل مرحلة مخرجات ومعيار قبول، ولكل إطلاق بيانات تساعد على قرار التحسين أو التوسع.</p></div></article>
      </div>
    </div></section>
    <section class="section-pad services-section" id="services"><div class="container">
      ${sectionHead("خدماتنا", "نظام خبرات حول هدف واحد", "نلغي المسافات بين الأمن السيبراني، والهندسة البرمجية، والذكاء الاصطناعي، واستراتيجيات النمو. ندمج هذه الطبقات في حل تقني واحد متكامل؛ جاهز للتشغيل الفوري، قابل للقياس الدقيق، ومصمم للتوسع بلا حدود.")}
      <div class="service-category-heading reveal"><span aria-hidden="true"></span><h3>خدمات الذكاء الاصطناعي</h3></div>
      <div class="ai-services-grid home-ai-services-grid">${aiHomepageServices.map(aiShowcaseCard).join("")}</div>
      <div class="section-action"><a class="button button-ghost" href="/agents/">قابل فريق وكلاء باودي ${icon("arrow", "button-icon")}</a></div>
      <div class="service-category-heading service-category-heading-spaced reveal"><span aria-hidden="true"></span><h3>الخدمات التقنية الحيوية الشاملة</h3></div>
      <div class="essential-services-grid home-essential-services-grid">${essentialHomepageServices.map(essentialShowcaseCard).join("")}</div>
      <div class="section-action"><a class="button button-ghost" href="/services/">استكشف صفحة الخدمات ${icon("arrow", "button-icon")}</a></div>
    </div></section>
    <section class="section-pad intelligence-section"><div class="container intelligence-grid">
      <div class="intelligence-copy reveal">${eyebrow("منهجية التشغيل")}<h2>من الفكرة إلى أثر قابل للقياس</h2><p>نبدأ من المشكلة والنتيجة، ثم نحدد البيانات والمخاطر والبنية قبل اختيار الأدوات. بهذه الطريقة تبقى التقنية في خدمة القرار، لا العكس.</p><a class="text-link" href="/about/">تعرّف على منهجيتنا ${icon("arrow")}</a></div>
      <div class="method-stack">
        <article class="reveal"><span>01</span><div><h3>Discover</h3><p>نفهم المستخدم والهدف والقيود والمخاطر.</p></div></article>
        <article class="reveal"><span>02</span><div><h3>Design</h3><p>نرسم المعمارية والتجربة ومقياس النجاح.</p></div></article>
        <article class="reveal"><span>03</span><div><h3>Build</h3><p>ننفذ على مراحل قصيرة قابلة للمراجعة.</p></div></article>
        <article class="reveal"><span>04</span><div><h3>Scale</h3><p>نطلق ونقيس ونحسن ونوسع بثقة.</p></div></article>
      </div>
    </div></section>
    <section class="section-pad iconography-section"><div class="container">
      ${sectionHead("التقنيات التي تقود حلولنا", "منظومة ذكاء مترابطة من البيانات إلى القرار", "نجمع تقنيات الذكاء الاصطناعي وتحليل البيانات والأتمتة ضمن منظومة واحدة؛ تتعلم من أعمالك، وتفهم أنماطها، وتحول البيانات إلى قرارات وتجارب رقمية أكثر ذكاءً وكفاءة.")}
      <div class="iconography-grid">${technologyIcons.map(([name, label, description], index) => `<article class="reveal"><span>${icon(name)}</span><div class="technology-copy"><small>${String(index + 1).padStart(2, "0")}</small><strong>${label}</strong><p>${description}</p></div></article>`).join("")}</div>
    </div></section>
    <section class="section-pad work-section"><div class="container">
      ${sectionHead("أعمال مختارة", "من الهدف التجاري إلى تجربة رقمية", "نماذج عامة في تطوير الويب والسيو المحلي وهندسة المحتوى وتجارب التحويل.")}
      <div class="work-grid">${work.map(workCard).join("")}</div>
      <div class="section-action"><a class="button button-ghost" href="/work/">استكشف الأعمال ${icon("arrow", "button-icon")}</a></div>
    </div></section>
    <section class="section-pad insights-section"><div class="container">
      ${sectionHead("مدونتنا", "رؤى عملية قبل القرار التقني", "محتوى يشرح المخاطر والخيارات ومعايير الاختيار في الذكاء الاصطناعي والأمن والويب والبحث.")}
      <div class="insights-grid">${insights.map(insightCard).join("")}</div>
    </div></section>
    <section class="section-pad faq-section"><div class="container faq-grid">
      <div class="faq-intro reveal">${eyebrow("الأسئلة الشائعة")}<h2>وضوح قبل بدء المشروع</h2><p>إذا كانت حالتك مختلفة، أرسل ملخصًا قصيرًا وسنقترح نقطة البداية الأنسب.</p><a class="button button-ghost" href="/contact/">أرسل تفاصيل مشروعك</a></div>
      <div class="accordion">${faq.map(([question, answer]) => `<details class="reveal"><summary>${question}<span>+</span></summary><p>${answer}</p></details>`).join("")}</div>
    </div></section>
    ${ctaSection()}`,
  });
}

function englishHomePage() {
  return layout({
    title: `${site.nameEn} | AI, Software & Digital Engineering`,
    description:
      "BOWDY LABS builds secure AI agents, software, cloud systems, cybersecurity foundations and search growth capabilities for businesses in Saudi Arabia and beyond.",
    path: "/en/",
    active: "home",
    language: "en",
    preloadHero: true,
    body: `
    <section class="hero section-pad hero-en"><div class="container hero-grid">
      <div class="hero-copy reveal">${eyebrow("Technology and AI company from Riyadh")}<p class="hero-kicker">${site.taglineEn}</p><h1>AI solutions that <span>think ahead</span> and deliver impact</h1><p class="hero-lead">We design secure, measurable systems across artificial intelligence, software, cloud, cybersecurity, Google and search growth.</p><div class="hero-actions"><a class="button" href="/contact/">Discuss your project ${icon("arrow", "button-icon")}</a><a class="button button-ghost" href="/services/">Explore capabilities</a></div><div class="hero-proof"><span>${icon("shield")}Secure by design</span><span>${icon("nodes")}Human-governed AI</span><span>${icon("chart")}Measurable impact</span></div></div>
      <div class="hero-visual reveal"><div class="hero-image-shell"><img src="${site.heroImageMedium}" srcset="${site.heroImageSmall} 760w, ${site.heroImageMedium} 1200w, ${site.heroImage} 1717w" sizes="(max-width: 900px) calc(100vw - 24px), 54vw" width="1717" height="916" alt="The official BOWDY LABS SparkNode mark rendered as a luminous artificial intelligence network" fetchpriority="high" decoding="async"><span class="scan-line" aria-hidden="true"></span></div><div class="hero-data-card hero-data-one"><small>AI DEVELOPMENT</small><strong>Ready</strong><i></i></div><div class="hero-data-card hero-data-two"><small>SECURITY</small><strong>By design</strong></div></div>
    </div><div class="container metrics reveal"><div><strong>09</strong><span>Connected capabilities</span></div><div><strong>04</strong><span>Discover, design, build, scale</span></div><div><strong>02</strong><span>Arabic and English experience</span></div><div><strong>360°</strong><span>Technology and business view</span></div></div></section>
    ${platformStrip(true)}
    <section class="section-pad services-section"><div class="container">${sectionHead("Capabilities", "One system of expertise around the outcome", "Security, software, AI and growth are designed together so the result can be operated, measured and improved.")}<div class="services-grid">${services.map((service) => serviceCard(service, true)).join("")}</div></div></section>
    <section class="section-pad intelligence-section"><div class="container intelligence-grid"><div class="intelligence-copy reveal">${eyebrow("Operating model")}<h2>From a useful idea to measurable impact</h2><p>We start with the problem, outcome, data and risk before choosing technology. The system stays accountable to the business decision.</p></div><div class="method-stack"><article class="reveal"><span>01</span><div><h3>Discover</h3><p>Users, goals, constraints and risk.</p></div></article><article class="reveal"><span>02</span><div><h3>Design</h3><p>Architecture, experience and success measures.</p></div></article><article class="reveal"><span>03</span><div><h3>Build</h3><p>Short, reviewable implementation cycles.</p></div></article><article class="reveal"><span>04</span><div><h3>Scale</h3><p>Launch, measure, improve and expand.</p></div></article></div></div></section>
    ${ctaSection({ english: true })}`,
  });
}

function servicesPage() {
  const aiServices = servicesShowcase.filter((service) => service.featured);
  const essentialServices = servicesShowcase.filter((service) => !service.featured);
  const serviceSchemas = servicesShowcase.map((service) => ({
    "@type": "Service",
    "@id": `${site.url}/services/#${service.id}`,
    name: service.title,
    alternateName: service.titleEn,
    serviceType: service.title,
    category: service.group,
    description: service.description,
    url: `${site.url}/services/#${service.id}`,
    provider: { "@id": `${site.url}/#local-business` },
    areaServed: [
      { "@type": "City", name: site.city },
      { "@type": "Country", name: site.country },
    ],
    audience: { "@type": "BusinessAudience", name: "الشركات والمؤسسات في السعودية" },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${site.url}/contact/?service=${service.contactService}`,
      servicePhone: {
        "@type": "ContactPoint",
        telephone: site.phone,
        contactType: "sales",
        availableLanguage: ["ar", "en"],
      },
    },
  }));
  const offerCatalog = {
    "@type": "OfferCatalog",
    "@id": `${site.url}/services/#catalog`,
    name: "كتالوج خدمات باودي لابز للذكاء الاصطناعي والتقنية",
    itemListElement: servicesShowcase.map((service) => ({
      "@type": "Offer",
      url: `${site.url}/contact/?service=${service.contactService}`,
      itemOffered: { "@id": `${site.url}/services/#${service.id}` },
    })),
  };
  const servicesProviderSchema = {
    ...professionalServiceSchema,
    hasOfferCatalog: { "@id": offerCatalog["@id"] },
  };
  const itemList = {
    "@type": "ItemList",
    "@id": `${site.url}/services/#list`,
    name: "خدمات باودي لابز للذكاء الاصطناعي والتقنية",
    numberOfItems: servicesShowcase.length,
    itemListElement: servicesShowcase.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.title,
      url: `${site.url}/services/#${service.id}`,
      item: { "@id": `${site.url}/services/#${service.id}` },
    })),
  };
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${site.url}/services/#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: "الخدمات", item: `${site.url}/services/` },
    ],
  };
  return layout({
    title: "شركة ذكاء اصطناعي سعودية وخدمات تقنية للشركات",
    description:
      "خدمات باودي لابز: وكلاء ذكاء اصطناعي بالعربية، منصات RAG، أتمتة AI، سلة وزد، تطبيقات، Google Ads، أمن سيبراني وERP في السعودية.",
    path: "/services/",
    active: "services",
    schema: [servicesProviderSchema, offerCatalog, itemList, breadcrumbSchema, ...serviceSchemas],
    mainEntity: { "@id": offerCatalog["@id"] },
    body: `<section class="services-hero section-pad">
      <div class="container services-hero-grid">
        <div class="services-hero-copy reveal">
          ${eyebrow("شركة ذكاء اصطناعي سعودية من الرياض")}
          <p class="hero-kicker" lang="en" dir="ltr">${site.taglineEn}</p>
          <h1>خدمات ذكاء اصطناعي وتقنية <span>تبني ميزة تنافسية</span> قابلة للقياس</h1>
          <p>باودي لابز شركة ذكاء اصطناعي سعودية تصمم حلولًا آمنة للشركات، من دمج واجهات AI ومنصات RAG إلى وكلاء ذكاء اصطناعي يتكلمون بالعربية، مع خدمات تطوير وأمن ونمو رقمي مترابطة تخدم السوق السعودي.</p>
          <div class="hero-actions"><a class="button" href="/contact/">ناقش مشروعك ${icon("arrow", "button-icon")}</a><a class="button button-ghost" href="#ai-services">استكشف خدمات AI</a></div>
          <div class="services-hero-proof"><span>${icon("shield")}أمان وحوكمة منذ التصميم</span><span>${icon("nodes")}تكامل مع أنظمة العمل</span><span>${icon("chart")}أثر قابل للقياس</span></div>
        </div>
        <div class="services-hero-visual reveal" aria-hidden="true">
          <div class="services-hero-stage">
            <span class="services-grid-plane"></span>
            <span class="services-orbit services-orbit-one"></span>
            <span class="services-orbit services-orbit-two"></span>
            <span class="services-orbit services-orbit-three"></span>
            <span class="services-flow services-flow-one"></span>
            <span class="services-flow services-flow-two"></span>
            <span class="services-flow services-flow-three"></span>
            <div class="services-ai-core">${logo("services-hero-logo")}<small>ARABIC-FIRST</small><strong>AI SYSTEMS</strong></div>
            <div class="services-hero-module services-module-api"><span>${icon("api")}</span><small>01</small><strong>AI API</strong></div>
            <div class="services-hero-module services-module-rag"><span>${icon("database")}</span><small>02</small><strong>RAG</strong></div>
            <div class="services-hero-module services-module-agent"><span>${icon("brain")}</span><small>03</small><strong>ARABIC AI</strong></div>
          </div>
          <div class="services-hero-signal">${logo("services-hero-signal-logo")}<span>BOWDY LABS · RIYADH</span></div>
        </div>
      </div>
    </section>
    <section class="section-pad service-choice-section"><div class="container service-choice-grid">
      <div class="service-choice-copy reveal">${eyebrow("حلول مبنية حول العمل")}
        <h2>نبدأ من التحدي التجاري ثم نصمم التقنية المناسبة</h2>
        <p>لا نضيف الذكاء الاصطناعي لمجرد أنه رائج. نحدد المهمة والبيانات والصلاحيات ونقطة التدخل البشري ومؤشر النجاح، ثم نختار النموذج والتكامل والبنية التي تحقق أفضل قيمة تشغيلية.</p>
        <p>يمكن تنفيذ خدمة مستقلة، أو جمع أكثر من مسار داخل منظومة واحدة؛ مثل ربط منصة RAG بوكيل دعم عربي، ثم تأمين البنية السحابية وقياس أثرها على زمن الاستجابة ورضا العملاء.</p>
      </div>
      <aside class="decision-card reveal"><span>${icon("spark")}</span><h2>معاييرنا قبل التنفيذ</h2><ol><li>هدف تشغيلي أو تجاري يمكن قياسه.</li><li>مصادر بيانات موثوقة وصلاحيات محددة.</li><li>معيار قبول واختبارات لحالات الاستخدام الفعلية.</li><li>خطة إطلاق ومراقبة وتحسين بعد التسليم.</li></ol></aside>
    </div></section>
    <section class="section-pad ai-services-section" id="ai-services"><div class="container">
      ${sectionHead("خدماتنا الرئيسية", "خدمات الذكاء الاصطناعي للشركات", "ثلاثة مسارات متقدمة صممناها للشركات التي تريد أتمتة العمل واستثمار المعرفة وتقديم خدمة عربية أكثر سرعة ودقة، مع ضوابط أمن وحوكمة قابلة للمراجعة.")}
      <div class="ai-services-grid">${aiServices.map(aiShowcaseCard).join("")}</div>
      <div class="section-action"><a class="button button-ghost" href="/agents/">تعرّف على وكلاء باودي ${icon("arrow", "button-icon")}</a></div>
    </div></section>
    <section class="section-pad essential-services-section" id="technology-services"><div class="container">
      ${sectionHead("منظومة متكاملة", "الخدمات التقنية الحيوية الشاملة", "ست خدمات تكمل طبقة الذكاء الاصطناعي وتربط التجربة الرقمية بالأمن والبنية السحابية والظهور المحلي والنمو المدفوع.")}
      <div class="essential-services-grid">${essentialServices.map(essentialShowcaseCard).join("")}</div>
    </div></section>
    ${ctaSection({ title: "حوّل التحدي إلى خارطة تنفيذ واضحة", description: "أرسل هدف المشروع والأنظمة الحالية والموعد المتوقع. سنقترح نقطة بداية عملية، والاعتماديات، ومؤشرات النجاح دون مشاركة أي بيانات حساسة." })}`,
  });
}

function servicePage(service) {
  const path = `/services/${service.slug}/`;
  const related = [
    ...services.filter((candidate) => candidate.slug !== service.slug && candidate.group === service.group),
    ...services.filter((candidate) => candidate.slug !== service.slug && candidate.group !== service.group),
  ].slice(0, 3);
  const serviceSchema = {
    "@type": "Service",
    "@id": `${site.url}${path}#service`,
    name: service.title,
    alternateName: service.titleEn,
    serviceType: service.title,
    description: service.description,
    url: `${site.url}${path}`,
    provider: { "@id": `${site.url}/#organization` },
    areaServed: { "@type": "Country", name: site.country },
  };
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${site.url}${path}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: "الخدمات", item: `${site.url}/services/` },
      { "@type": "ListItem", position: 3, name: service.title, item: `${site.url}${path}` },
    ],
  };
  const faqSchema = {
    "@type": "FAQPage",
    "@id": `${site.url}${path}#faq`,
    mainEntity: service.faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return layout({
    title: service.seoTitle,
    description: service.description,
    path,
    active: "services",
    schema: [serviceSchema, breadcrumbSchema, faqSchema],
    body: `${breadcrumbs([["الرئيسية", "/"], ["الخدمات", "/services/"], [service.title, path]])}
    ${pageHero(service.group, service.title, service.intro, `<div class="hero-actions"><a class="button" href="/contact/?service=${service.slug}">ناقش هذا المسار ${icon("arrow", "button-icon")}</a><a class="button button-ghost" href="/services/">كل الخدمات</a></div>`)}
    <section class="section-pad service-overview-section"><div class="container service-overview-grid">
      <article class="service-overview-copy reveal">${eyebrow("فهم الخدمة")}<h2>حل يبدأ من السياق وينتهي بمخرج قابل للاستخدام</h2>${service.overview.map((paragraph) => `<p>${paragraph}</p>`).join("")}</article>
      <aside class="ideal-card reveal"><span class="scope-icon">${icon(service.icon)}</span><small>متى تكون الخدمة مناسبة؟</small><h2>حالات تستفيد من هذا المسار</h2><ul>${service.idealFor.map((item) => `<li>${icon("check")}<span>${item}</span></li>`).join("")}</ul></aside>
    </div></section>
    <section class="section-pad challenges-section"><div class="container">
      ${sectionHead("المشكلة قبل الحل", "تحديات نعالجها ضمن هذا المسار", "نربط كل تحدٍّ بأثره على التشغيل أو المستخدم أو المخاطر، ثم نحدد ما يحتاج إلى معالجة الآن وما يمكن تحسينه لاحقًا.")}
      <div class="challenge-grid">${service.challenges.map(([title, text], index) => `<article class="challenge-card reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>
    </div></section>
    <section class="section-pad service-detail"><div class="container detail-grid">
      <div class="detail-block reveal">${eyebrow("النتائج")}<h2>ما الذي يجب أن يتغير بعد التنفيذ؟</h2><div class="outcome-list">${service.outcomes.map((outcome) => `<p>${icon("check")}<span>${outcome}</span></p>`).join("")}</div></div>
      <div class="scope-card reveal"><span class="scope-icon">${icon(service.icon)}</span><small>${service.number}</small><h2>نطاق قابل للتخصيص</h2>${service.scope.map((item) => `<p>${item}</p>`).join("")}</div>
    </div></section>
    <section class="section-pad deliverables-section"><div class="container">
      ${sectionHead("المخرجات", "ما الذي تستلمه بنهاية المشروع؟", "تتغير التفاصيل بحسب النطاق، لكننا نحافظ على مخرجات واضحة يمكن مراجعتها واستخدامها ومتابعة تنفيذها.")}
      <div class="deliverables-grid">${service.deliverables.map(([title, text], index) => `<article class="deliverable-card reveal"><div><span>${String(index + 1).padStart(2, "0")}</span>${icon("arrow")}</div><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>
    </div></section>
    <section class="section-pad process-section"><div class="container">${sectionHead("منهج التنفيذ", "أربع مراحل من التشخيص إلى التحسين", "لكل مرحلة هدف ومخرج ومعيار مراجعة؛ فلا تنتقل المهمة إلى المرحلة التالية اعتمادًا على الانطباع وحده.")}<ol class="process-grid process-grid-detailed">${service.steps.map((step, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${step}</h3><p>${service.processDetails[index]}</p></li>`).join("")}</ol></div></section>
    <section class="section-pad related-services-section"><div class="container">
      ${sectionHead("خدمات مرتبطة", "قد يحتاج التحدي إلى أكثر من طبقة", "نقترح الخدمة المرتبطة فقط عندما تؤثر فعليًا في النتيجة، ويمكن إبقاؤها مرحلة لاحقة إذا لم تكن ضرورية الآن.")}
      <div class="services-grid related-services-grid">${related.map((candidate) => serviceCard(candidate)).join("")}</div>
    </div></section>
    <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("قبل البدء")}<h2>أسئلة شائعة عن ${service.title}</h2><p>توضح الإجابات حدود الخدمة وطريقة العمل. ويُحدد النطاق النهائي بعد فهم النظام والهدف والبيانات والقيود.</p><a class="button button-ghost" href="/contact/?service=${service.slug}">أرسل تفاصيل حالتك</a></div><div class="accordion">${service.faq.map(([question, answer]) => `<details class="reveal"><summary>${question}<span>+</span></summary><p>${answer}</p></details>`).join("")}</div></div></section>
    ${ctaSection({ title: `ابدأ مشروع ${service.title}`, description: "أرسل ملخصًا عن الوضع الحالي والنتيجة المطلوبة والموعد المتوقع، دون مشاركة بيانات حساسة." })}`,
  });
}

function aboutPage() {
  return layout({
    title: "عن باودي لابز",
    description:
      "تعرف على باودي لابز ورؤيتها في بناء حلول ذكاء اصطناعي وبرمجيات وأمن وسحابة ونمو رقمي قابلة للقياس من الرياض إلى الأسواق العربية.",
    path: "/about/",
    active: "about",
    body: `${pageHero("عن المختبر", "نحوّل التعقيد التقني إلى قرار واضح ونظام يعمل", "باودي لابز شركة تقنية عربية تنطلق من الرياض، وتجمع الذكاء الاصطناعي والبرمجيات والأمن والسحابة ومنظومة Google والنمو الرقمي داخل مسار تنفيذ واحد يمكن فهمه وقياسه وتطويره.")}
    <section class="section-pad about-story"><div class="container about-grid">
      <div class="about-copy reveal">${eyebrow("لماذا BOWDY LABS؟")}<h2>مختبر حلول، لا مجرد مورد أدوات</h2><p>تعبّر كلمة LABS عن طريقة عمل عملية: نفهم المشكلة، ونختبر الفرضية بأقل تكلفة ممكنة، ثم نبني ما أثبت قيمته. لا نختار التقنية لأنها رائجة؛ نختارها عندما تخدم المستخدم وتقلل المخاطر وتمنح الفريق قدرة أفضل على التشغيل والقياس.</p><p>نربط كل قرار تقني بأثره على العمل. فالواجهة لا تنفصل عن المحتوى، والمحتوى لا ينفصل عن الفهرسة، والذكاء الاصطناعي لا ينفصل عن جودة البيانات والصلاحيات، والبنية السحابية لا تنفصل عن الأمان والتعافي والتكلفة.</p><p>نعمل بعقلية أمنية منذ التصميم، ونضع الرقابة البشرية والشفافية في قلب مشروعات الذكاء الاصطناعي. كما نبني تجربة عربية أصيلة تراعي اللغة واتجاه RTL وسلوك المستخدم المحلي، لا نسخة مترجمة بصورة سطحية من منتج أجنبي.</p><p>ومن الرياض نخدم شركات ومشروعات داخل السعودية وخارجها عبر نطاق واضح، ومراحل قصيرة قابلة للمراجعة، وتوثيق يساعد العميل على فهم ما بُني وكيف يُشغّل وما الذي يحتاج إلى تطوير لاحقًا.</p></div>
      <div class="mission-card reveal"><span>${logo("mission-logo")}</span><small>OUR NORTH STAR</small><h2>${site.taglineEn}</h2><p>${site.taglineAr}</p></div>
    </div></section>
    <section class="section-pad values-section"><div class="container">${sectionHead("قيم التشغيل", "ثلاثة مبادئ تحكم كل قرار", "هوية باودي لابز ليست ألوانًا وشعارًا فقط؛ بل التزام بطريقة تفكير تظهر في النطاق والتصميم والكود والقياس.")}<div class="values-grid"><article class="reveal"><span>01</span><h3>Intelligence</h3><p>نفهم السياق والمستخدم والبيانات والمخاطر قبل اختيار التقنية، ونفصل بين الحقيقة والافتراض وما يحتاج إلى تجربة.</p></article><article class="reveal"><span>02</span><h3>Innovation</h3><p>نستخدم الجديد عندما يحسن النتيجة أو يقلل التكلفة أو يفتح قدرة مفيدة، لا لمجرد الظهور الحديث.</p></article><article class="reveal"><span>03</span><h3>Impact</h3><p>نحدد مقياس نجاح ومخرجًا قابلًا للقبول، ونبني مسارًا واضحًا من التنفيذ إلى الأثر التشغيلي أو التجاري.</p></article></div></div></section>
    <section class="section-pad operating-standards-section"><div class="container">
      ${sectionHead("معايير العمل", "ما الذي يمكنك توقعه أثناء المشروع؟", "نحافظ على وضوح القرار والمسؤولية والجودة من أول جلسة حتى الإطلاق وما بعده.")}
      <div class="standards-grid">
        <article class="reveal"><span>${icon("search")}</span><h3>تشخيص قبل الحل</h3><p>نفهم السبب الجذري والاعتماديات قبل اقتراح أداة أو منصة أو إعادة تصميم.</p></article>
        <article class="reveal"><span>${icon("nodes")}</span><h3>نطاق قابل للمراجعة</h3><p>نحدد ما يدخل في المشروع والمخرجات ومعيار القبول والتغييرات التي تحتاج قرارًا جديدًا.</p></article>
        <article class="reveal"><span>${icon("shield")}</span><h3>حماية ومسؤولية</h3><p>نقلل البيانات والصلاحيات ونوثق القرارات الحساسة ولا ننفذ فحصًا نشطًا دون تصريح.</p></article>
        <article class="reveal"><span>${icon("chart")}</span><h3>قياس وتحسين</h3><p>نربط الإطلاق بمؤشرات واضحة ونميز بين النتائج المبكرة والأثر الذي يحتاج إلى وقت وبيانات.</p></article>
      </div>
    </div></section>
    ${ctaSection()}`,
  });
}

function workPage() {
  return layout({
    title: "الأعمال والمشروعات الرقمية",
    description:
      "مختارات من أعمال باودي لابز وخبرة الفريق في تطوير المواقع وتجربة الجوال والسيو التقني والمحلي وهندسة المحتوى وصفحات التحويل.",
    path: "/work/",
    active: "work",
    body: `${pageHero("الأعمال", "مشروعات تربط التصميم بالأداء والظهور", "نعرض نماذج منشورة تشرح نوع المشكلة والمنظومة المبنية حولها، مع احترام خصوصية تفاصيل العملاء.")}
    <section class="section-pad"><div class="container"><div class="work-grid work-grid-page">${work.map(workCard).join("")}</div></div></section>
    <section class="section-pad outcome-section"><div class="container">${sectionHead("ما وراء الواجهة", "ما الذي نراجعه في كل مشروع؟")}<div class="values-grid"><article class="reveal"><span>UX</span><h3>رحلة المستخدم</h3><p>وضوح الخدمة والثقة ومسار القرار على كل جهاز.</p></article><article class="reveal"><span>SEO</span><h3>قابلية الاكتشاف</h3><p>الفهرسة والبيانات المنظمة والأداء وهندسة المحتوى.</p></article><article class="reveal"><span>SEC</span><h3>أساس آمن</h3><p>الصلاحيات والنشر والأسرار وتقليل مساحة المخاطر.</p></article></div></div></section>
    ${ctaSection()}`,
  });
}

function insightsPage() {
  return layout({
    title: "رؤى باودي لابز التقنية",
    description:
      "رؤى عملية من باودي لابز عن الذكاء الاصطناعي والأمن السيبراني وتطوير المواقع والسحابة ومنتجات Google وSEO والبحث الذكي.",
    path: "/insights/",
    active: "insights",
    body: `${pageHero("مدونتنا", "محتوى يساعدك على اتخاذ قرار تقني أفضل", "نكتب عن المخاطر والخيارات ومعايير القبول والتشغيل، لا عن الضجيج التقني.")}<section class="section-pad"><div class="container insights-grid insights-grid-page">${insights.map(insightCard).join("")}</div></section>${ctaSection()}`,
  });
}

function insightPage(item) {
  const path = `/insights/${item.slug}/`;
  const sections = {
    "ai-agent-business": [
      ["ابدأ من عملية محددة", "أفضل نقطة بداية ليست «نريد ذكاءً اصطناعيًا»، بل مهمة متكررة لها مدخلات ومخرجات ومستخدم ومسؤول واضح. كلما كان نطاق الحالة قابلًا للوصف والاختبار، كانت فرصة النجاح أعلى."],
      ["جهّز المعرفة والصلاحيات", "حدّد المصادر المسموح بها ومن يحدّثها وما الذي لا يجوز للوكيل الوصول إليه. لا تعالج الصلاحيات بعد ربط البيانات؛ صمّمها قبل ذلك."],
      ["ابنِ تقييمًا واقعيًا", "اجمع أسئلة وحالات من الاستخدام الحقيقي، ثم قِس صحة الاسترجاع والالتزام بالتعليمات ومعدل التدخل البشري. العرض المثير ليس دليل جودة."],
      ["وسّع بعد اجتياز الحاجز", "ابدأ بإجراء منخفض المخاطر، أضف الرقابة البشرية، ووسّع الأدوات والصلاحيات فقط بعد ثبات الجودة والسجلات."],
    ],
    "secure-digital-product": [
      ["حدود الثقة", "ارسم من يستطيع الوصول إلى ماذا، وما الذي يأتي من خارج النظام، وأين يجب التحقق أو التسجيل أو الرفض."],
      ["إدارة الأسرار", "لا تُخزن المفاتيح في المستودع أو الواجهة. استخدم بيئات تشغيل وصلاحيات ضيقة وتدويرًا واضحًا عند الاشتباه."],
      ["التعافي قبل الحادث", "اختبر النسخ الاحتياطي والاستعادة، وحدد المسؤول عن القرار والاتصال عند التعطل أو تسرب البيانات."],
      ["الأمان كتجربة", "رسائل الخطأ وتدفقات تسجيل الدخول والصلاحيات جزء من تجربة المستخدم، ويمكن تصميمها بوضوح دون كشف معلومات حساسة."],
    ],
    "search-ready-website": [
      ["بنية مفهومة", "اجعل لكل خدمة صفحة واضحة وعنوانًا ووصفًا ومسارًا داخليًا. الروابط والعناوين هي خريطة للمستخدم ومحرك البحث معًا."],
      ["أداء وتجربة", "قلّل الاعتماديات والصور الثقيلة، واحمِ المساحة من القفز البصري، واختبر اللمس والقراءة على الجوال."],
      ["بيانات منظمة صادقة", "استخدم Schema لما هو موجود فعليًا في الصفحة، واربط المؤسسة والخدمة والمقال دون إنشاء اعتمادات أو تقييمات غير حقيقية."],
      ["محتوى يستحق الاسترجاع", "أجب عن أسئلة القرار بلغة دقيقة مع أمثلة وحدود واضحة، فهذا يفيد البحث التقليدي وتجارب الذكاء الاصطناعي معًا."],
    ],
  }[item.slug];
  const articleSchema = {
    "@type": "Article",
    "@id": `${site.url}${path}#article`,
    headline: item.title,
    description: item.excerpt,
    inLanguage: "ar-SA",
    author: { "@id": `${site.url}/#organization` },
    publisher: { "@id": `${site.url}/#organization` },
    datePublished: "2026-07-28",
    dateModified: "2026-07-29",
  };
  return layout({
    title: item.title,
    description: item.excerpt,
    path,
    active: "insights",
    type: "article",
    schema: [articleSchema],
    body: `${pageHero(item.category, item.title, item.excerpt, `<p class="article-meta">${item.readTime} · آخر تحديث 29 يوليو 2026</p>`)}
    <article class="article section-pad"><div class="container article-layout"><aside class="article-aside"><strong>في هذا الدليل</strong>${sections.map(([heading], index) => `<a href="#section-${index + 1}">${String(index + 1).padStart(2, "0")} ${heading}</a>`).join("")}</aside><div class="article-body">${sections.map(([heading, paragraph], index) => `<section id="section-${index + 1}" class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h2>${heading}</h2><p>${paragraph}</p></section>`).join("")}<div class="article-note">${icon("shield")}<p>طبّق هذه المبادئ وفق حساسية بياناتك ونطاقك النظامي، واستعن بمختص عند القرارات عالية المخاطر.</p></div></div></div></article>
    ${ctaSection()}`,
  });
}

function contactPage() {
  return layout({
    title: "تواصل وطلب مشروع",
    description:
      "تواصل مع باودي لابز في الرياض لطلب مشروع ذكاء اصطناعي أو أمن سيبراني أو سحابة أو تطوير برمجيات أو Google أو SEO.",
    path: "/contact/",
    active: "contact",
    body: `${pageHero("تواصل", "ابدأ بوصف النتيجة، لا الأداة", "اختر المسار واكتب ملخصًا عن الوضع الحالي والهدف والموعد المتوقع. لا ترسل كلمات مرور أو رموز تحقق أو مفاتيح سرية.")}
    <section class="section-pad contact-section"><div class="container contact-grid">
      <div class="contact-options reveal"><article>${icon("whatsapp")}<div><small>WhatsApp</small><h2>محادثة مباشرة</h2><a href="${site.whatsapp}" target="_blank" rel="noopener" dir="ltr">${site.phoneDisplay}</a></div></article><article>${icon("phone")}<div><small>اتصال</small><h2>الرقم الأساسي</h2><a href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a></div></article><article>${icon("mail")}<div><small>البريد</small><h2>تفاصيل رسمية</h2><a href="mailto:${site.email}">${site.email}</a></div></article><article>${icon("pin")}<div><small>نطاق العمل</small><h2>${site.city}</h2><p>داخل السعودية وعن بُعد</p></div></article><div class="security-note">${icon("shield")}<p><strong>تنبيه أمني:</strong> لا ترسل كلمة مرور أو رمز تحقق أو مفتاح API. استخدم وصفًا منزوع البيانات الحساسة.</p></div></div>
      <form class="contact-form reveal" data-contact-form><div class="form-head"><span>PROJECT BRIEF</span><h2>جهّز رسالة واضحة خلال دقيقة</h2><p>سنفتح لك رسالة WhatsApp يمكنك مراجعتها قبل الإرسال.</p></div><label>الاسم أو اسم الشركة<input type="text" name="name" autocomplete="name" maxlength="80" required placeholder="مثال: محمد / شركة ..."></label><label>المسار المطلوب<select name="service" required><option value="">اختر المسار</option>${services.map((service) => `<option value="${service.slug}">${service.title}</option>`).join("")}</select></label><label>الميزانية التقريبية<select name="budget"><option value="غير محددة">غير محددة</option><option value="أقل من 10,000 ريال">أقل من 10,000 ريال</option><option value="10,000–30,000 ريال">10,000–30,000 ريال</option><option value="30,000–100,000 ريال">30,000–100,000 ريال</option><option value="أكثر من 100,000 ريال">أكثر من 100,000 ريال</option></select></label><label>الهدف والوضع الحالي<textarea name="goal" rows="6" maxlength="1000" required placeholder="اكتب المشكلة والنتيجة المطلوبة والموعد المتوقع دون بيانات حساسة"></textarea></label><button class="button" type="submit">فتح الرسالة في WhatsApp ${icon("whatsapp", "button-icon")}</button><p class="form-status" role="status" aria-live="polite"></p></form>
    </div></section>`,
  });
}

function legalPage(kind) {
  const privacy = kind === "privacy";
  const title = privacy ? "سياسة الخصوصية" : "شروط الاستخدام";
  const path = privacy ? "/privacy/" : "/terms/";
  const sections = privacy
    ? [
        ["البيانات التي ترسلها", "لا يتطلب الموقع حسابًا. عند التواصل عبر WhatsApp أو البريد، تتحكم القناة المختارة في البيانات التي ترسلها. لا ترسل بيانات اعتماد أو أسرارًا."],
        ["التحليلات", "يمكن استخدام قياس عام يحترم الخصوصية لتحسين تجربة الموقع، ولا يُرسل نص ملخص المشروع إلى أدوات التحليل."],
        ["الاستخدام والحماية", "نستخدم بيانات التواصل لفهم الاستفسار والرد عليه ونقلل الاحتفاظ بما لا يلزم، مع العلم أن أي قناة خارجية لها سياساتها الخاصة."],
        ["حقوقك", `يمكن الاستفسار عن بيانات التواصل أو طلب حذفها عبر ${site.email} مع مراعاة الالتزامات النظامية وحماية الحقوق.`],
      ]
    : [
        ["طبيعة المحتوى", "المحتوى تعريفي وتعليمي ولا يمثل ضمانًا لنتيجة تقنية أو ترتيب بحث أو قرار صادر عن منصة خارجية."],
        ["نطاق الخدمات", "يُحدد نطاق كل مشروع ومخرجاته ومسؤولياته قبل التنفيذ، ولا يبدأ أي فحص أمني نشط دون تصريح مكتوب."],
        ["الملكية الفكرية", "الهوية والنصوص والأصول الأصلية محمية، وتبقى العلامات الخارجية ملكًا لأصحابها ولا يعني ذكرها وجود شراكة."],
        ["الاستخدام الآمن", "يحظر إرسال بيانات اعتماد أو محتوى غير مشروع أو طلب نشاط غير مصرح به."],
      ];
  return layout({
    title,
    description: `${title} لموقع باودي لابز وتوضيح التعامل مع بيانات التواصل وحدود المحتوى والخدمات.`,
    path,
    body: `${pageHero("معلومات قانونية", title, privacy ? "نوضح كيف نتعامل مع بيانات التواصل باحترام وشفافية." : "نوضح طبيعة المحتوى والخدمات والاستخدام المسؤول للموقع.")}<article class="legal section-pad"><div class="container article-body">${sections.map(([heading, text], index) => `<section class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h2>${heading}</h2><p>${text}</p></section>`).join("")}<p class="legal-updated">آخر تحديث: 29 يوليو 2026.</p></div></article>`,
  });
}

function notFoundPage() {
  return layout({
    title: "الصفحة غير موجودة",
    description:
      "تعذر العثور على الصفحة المطلوبة في موقع باودي لابز؛ عد إلى الصفحة الرئيسية أو استكشف خدمات الذكاء الاصطناعي والتقنية.",
    path: "/404.html",
    robots: "noindex, follow",
    body: `<section class="not-found"><div class="container reveal"><span>404</span><h1>هذه الإشارة لا تقود إلى صفحة موجودة</h1><p>قد يكون الرابط قديمًا أو كُتب بصورة غير صحيحة.</p><div class="hero-actions"><a class="button" href="/">العودة للرئيسية</a><a class="button button-ghost" href="/services/">الخدمات</a></div></div></section>`,
  });
}

async function output(relativePath, content) {
  const file = join(dist, relativePath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content.replace(/[ \t]+$/gm, ""), "utf8");
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "assets"), join(dist, "assets"), { recursive: true });
const sourceCss = await readFile(join(root, "assets/css/main.css"), "utf8");
const minifiedCss = sourceCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();
await writeFile(join(dist, "assets/css/main.css"), minifiedCss, "utf8");
const sourceJs = await readFile(join(root, "assets/js/main.js"), "utf8");
const minifiedJs = await minify(sourceJs, {
  compress: { passes: 2 },
  mangle: true,
  format: { comments: false },
});
if (!minifiedJs.code) throw new Error("JavaScript minification produced no output.");
await writeFile(join(dist, "assets/js/main.js"), minifiedJs.code, "utf8");

const pages = [
  ["index.html", homePage(), true],
  ["en/index.html", englishHomePage(), true],
  ["crm/index.html", alarganCrmPage(), true],
  ["agents/index.html", layout(agentsPageModel("ar")), true],
  ["en/agents/index.html", layout(agentsPageModel("en")), true],
  ["services/index.html", servicesPage(), true],
  ["about/index.html", aboutPage(), true],
  ["work/index.html", workPage(), true],
  ["insights/index.html", insightsPage(), true],
  ["contact/index.html", contactPage(), true],
  ["privacy/index.html", legalPage("privacy"), true],
  ["terms/index.html", legalPage("terms"), true],
  ["404.html", notFoundPage(), false],
];

services.forEach((service) => pages.push([`services/${service.slug}/index.html`, servicePage(service), true]));
insights.forEach((item) => pages.push([`insights/${item.slug}/index.html`, insightPage(item), true]));
await Promise.all(pages.map(([path, content]) => output(path, content)));

const routeFor = (file) => (file === "index.html" ? "/" : `/${file.replace(/index\.html$/, "")}`);
const routes = pages.filter(([, , indexable]) => indexable).map(([file]) => routeFor(file));
await output(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${site.url}${route}</loc><lastmod>2026-08-16</lastmod><changefreq>monthly</changefreq><priority>${route === "/" ? "1.0" : route === "/services/" || route === "/agents/" ? "0.9" : "0.8"}</priority></url>`).join("\n")}\n</urlset>\n`,
);
await output("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
await output(
  "manifest.webmanifest",
  `${JSON.stringify(
    {
      id: "/",
      name: `${site.nameEn} — ${site.nameAr}`,
      short_name: site.nameEn,
      description: site.description,
      start_url: "/",
      display: "standalone",
      lang: "ar",
      dir: "rtl",
      background_color: "#050815",
      theme_color: "#050815",
      icons: [
        { src: "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  )}\n`,
);
await output(
  ".well-known/security.txt",
  `Contact: mailto:${site.email}\nCanonical: ${site.url}/.well-known/security.txt\nPreferred-Languages: ar, en\nExpires: 2027-07-28T00:00:00.000Z\n`,
);
await output(
  "llms.txt",
  `# ${site.nameEn} — ${site.nameAr}\n\n> ${site.description}\n\n## الهوية\n- الشعار اللفظي: ${site.taglineAr}\n- English tagline: ${site.taglineEn}\n- المقر: ${site.city}، ${site.country}\n\n## الخدمات\n${services.map((service) => `- ${service.title}: ${site.url}/services/${service.slug}/`).join("\n")}\n\n## وكلاء باودي\n${agents.map((agent) => `- ${agent.name} (${agent.nameEn}): ${site.url}/agents/#${agent.slug}`).join("\n")}\n\n## روابط أساسية\n- الخدمات: ${site.url}/services/\n- وكلاء الذكاء الاصطناعي: ${site.url}/agents/\n- الأعمال: ${site.url}/work/\n- عن الشركة: ${site.url}/about/\n- التواصل: ${site.url}/contact/\n`,
);
await output(
  "feed.xml",
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${site.nameEn} Insights</title><link>${site.url}/insights/</link><description>${esc(site.description)}</description><language>ar-SA</language>${insights.map((item) => `<item><title>${esc(item.title)}</title><link>${site.url}/insights/${item.slug}/</link><guid>${site.url}/insights/${item.slug}/</guid><pubDate>Tue, 28 Jul 2026 12:00:00 GMT</pubDate><description>${esc(item.excerpt)}</description></item>`).join("")}</channel></rss>`,
);

console.log(`Built ${pages.length} HTML pages for ${site.nameEn}.`);
