import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const buildDate = new Date().toISOString().slice(0, 10);

const legalPages = [
  {
    slug: "privacy",
    ar: "/privacy/",
    en: "/en/privacy/",
    title: "Privacy Policy",
    description: "BOWDY LABS privacy policy explaining contact data, privacy-aware analytics, data use and user requests.",
    intro: "How BOWDY LABS handles contact information with clarity, data minimization and respect for privacy.",
    sections: [
      ["Information you send", "The website does not require an account. When you contact us through WhatsApp or email, the channel you choose determines the information you send. Do not send credentials, verification codes, API keys or other secrets."],
      ["Analytics", "We may use general privacy-aware measurement to improve the website experience. The free-text project summary, your name and other contact details are not sent to our analytics events."],
      ["Use and protection", "We use contact information to understand and respond to your enquiry and aim to retain only what is reasonably needed. External communication platforms operate under their own privacy policies."],
      ["Your requests", "You may ask about contact information you shared with us or request deletion by emailing info@bowdylabs.com, subject to applicable legal obligations and the protection of legitimate rights."],
    ],
  },
  {
    slug: "terms",
    ar: "/terms/",
    en: "/en/terms/",
    title: "Terms of Use",
    description: "BOWDY LABS website terms covering informational content, project scope, intellectual property and safe use.",
    intro: "The terms below explain the nature of this website, project scope and responsible use of BOWDY LABS content and services.",
    sections: [
      ["Nature of the content", "Website content is informational and educational. It does not guarantee a technical outcome, search ranking or decision made by an external platform."],
      ["Service scope", "The scope, deliverables and responsibilities of each project are defined before implementation. No active security testing begins without appropriate written authorization."],
      ["Intellectual property", "BOWDY LABS identity, original copy and original assets are protected. Third-party trademarks remain the property of their respective owners, and mentioning a platform does not imply an official partnership."],
      ["Safe use", "Do not send credentials, unlawful content or requests for unauthorized activity through the website or its communication channels."],
    ],
  },
];

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function alternates(ar, en) {
  return `<link rel="alternate" hreflang="ar" href="${site.url}${ar}"><link rel="alternate" hreflang="ar-SA" href="${site.url}${ar}"><link rel="alternate" hreflang="en" href="${site.url}${en}"><link rel="alternate" hreflang="x-default" href="${site.url}${ar}">`;
}

function replaceAlternates(html, ar, en) {
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, "");
  return html.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n  ${alternates(ar, en)}`);
}

function legalSchema(page) {
  const url = `${site.url}${page.en}`;
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${page.title} | ${site.nameEn}`,
        description: page.description,
        inLanguage: "en",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#organization` },
        dateModified: buildDate,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en/` },
          { "@type": "ListItem", position: 2, name: page.title, item: url },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.nameEn,
        alternateName: site.nameAr,
        url: site.url,
        logo: `${site.url}${site.logo}`,
        email: site.email,
        telephone: site.phone,
        address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.nameEn,
        inLanguage: ["ar-SA", "en"],
        publisher: { "@id": `${site.url}/#organization` },
      },
    ],
  }).replaceAll("<", "\\u003c")}</script>`;
}

function legalMain(page) {
  return `<section class="page-hero section-pad"><div class="container page-hero-grid"><div class="reveal"><span class="eyebrow"><i aria-hidden="true"></i>LEGAL INFORMATION</span><h1>${page.title}</h1><p>${page.intro}</p></div><div class="page-hero-symbol reveal" aria-hidden="true"><span></span><img class="page-hero-logo" src="${site.logo}" width="72" height="72" alt=""></div></div></section><article class="legal section-pad"><div class="container article-body">${page.sections.map(([heading, copy], index) => `<section class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h2>${heading}</h2><p>${copy}</p></section>`).join("")}<p class="legal-updated">Last updated: July 29, 2026.</p></div></article>`;
}

function setPageMeta(html, page) {
  const fullTitle = `${page.title} | ${site.nameEn}`;
  const canonical = `${site.url}${page.en}`;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(page.description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(fullTitle)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(page.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(fullTitle)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(fullTitle)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(page.description)}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, legalSchema(page));
  return replaceAlternates(html, page.ar, page.en);
}

function replaceLanguageTarget(html, target) {
  return html.replace(/(<a class="language-link" href=")[^"]*("[^>]*>)/g, `$1${target}$2`);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const shellPath = join(dist, "en", "about", "index.html");
let shell = await readFile(shellPath, "utf8");

for (const page of legalPages) {
  let html = setPageMeta(shell, page);
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${legalMain(page)}</main>`);
  html = replaceLanguageTarget(html, page.ar);
  html = html.replaceAll('href="/privacy/">Privacy</a>', 'href="/en/privacy/">Privacy</a>');
  html = html.replaceAll('href="/terms/">Terms</a>', 'href="/en/terms/">Terms</a>');
  const destination = join(dist, "en", page.slug, "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html, "utf8");

  const arabicPath = join(dist, page.slug, "index.html");
  let arabic = await readFile(arabicPath, "utf8");
  arabic = replaceAlternates(arabic, page.ar, page.en);
  arabic = replaceLanguageTarget(arabic, page.en);
  await writeFile(arabicPath, arabic, "utf8");
}

const englishFiles = (await walk(join(dist, "en"))).filter((path) => path.endsWith(".html"));
for (const path of englishFiles) {
  let html = await readFile(path, "utf8");
  html = html
    .replaceAll('href="/privacy/">Privacy</a>', 'href="/en/privacy/">Privacy</a>')
    .replaceAll('href="/terms/">Terms</a>', 'href="/en/terms/">Terms</a>');

  if (!path.endsWith(join("en", "index.html"))) {
    html = html.replace(/\s*<link rel="preload" as="image" href="\/assets\/media\/bowdy-intelligence-1200\.webp"[^>]*>/, "");
  }

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  if (titleMatch) {
    html = html.replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${titleMatch[1]}">`);
  }

  await writeFile(path, html, "utf8");
}

let sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
for (const page of legalPages) {
  const escaped = `${site.url}${page.en}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  sitemap = sitemap.replace(new RegExp(`\\s*<url><loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, "g"), "");
}
const sitemapEntries = legalPages.map((page) => `  <url><loc>${site.url}${page.en}</loc><lastmod>${buildDate}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`).join("\n");
sitemap = sitemap.replace("</urlset>", `${sitemapEntries}\n</urlset>`);
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");

for (const page of legalPages) {
  const english = await readFile(join(dist, "en", page.slug, "index.html"), "utf8");
  const arabic = await readFile(join(dist, page.slug, "index.html"), "utf8");
  if (!english.includes(`hreflang="ar-SA" href="${site.url}${page.ar}"`) || !english.includes(`hreflang="en" href="${site.url}${page.en}"`)) throw new Error(`English hreflang incomplete: ${page.en}`);
  if (!arabic.includes(`hreflang="en" href="${site.url}${page.en}"`)) throw new Error(`Arabic reciprocal hreflang incomplete: ${page.ar}`);
}

console.log("Added English Privacy/Terms, reciprocal hreflang, English legal footer links, and non-home metadata/preload polish.");
