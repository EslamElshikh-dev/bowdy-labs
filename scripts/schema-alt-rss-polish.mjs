import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { insights, site } from "../src/content.mjs";
import { insightGuides } from "../src/insights-engine-content.mjs";
import { wave2Guides } from "../src/insights-wave2-content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

// These timestamps are the verified main-branch publication commits for each wave.
const wave1PublishedIso = "2026-09-06T00:29:09Z";
const wave2PublishedIso = "2026-09-06T00:39:01Z";
const legacyPublishedRfc = "Tue, 28 Jul 2026 12:00:00 GMT";

const xmlEsc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const route = (lang, slug) => `${lang === "en" ? "/en" : ""}/insights/${slug}/`;
const htmlPath = (lang, slug) => join(dist, ...(route(lang, slug).split("/").filter(Boolean)), "index.html");

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function makeEmptyAltExplicitlyDecorative(html) {
  return html.replace(/<img\b[^>]*\balt\s*=\s*(["'])\1[^>]*>/gi, (tag) => {
    let next = tag;
    if (!/\brole\s*=\s*(["'])presentation\1/i.test(next)) {
      next = next.replace(/\balt\s*=\s*(["'])\1/i, (alt) => `${alt} role="presentation"`);
    }
    if (!/\baria-hidden\s*=\s*(["'])true\1/i.test(next)) {
      next = next.replace(/\balt\s*=\s*(["'])\1/i, (alt) => `${alt} aria-hidden="true"`);
    }
    return next;
  });
}

function assertEveryImageHasAlt(html, file) {
  const images = html.match(/<img\b[^>]*>/gi) || [];
  for (const image of images) {
    if (!/\balt\s*=\s*(["'])[^"']*\1/i.test(image)) {
      throw new Error(`Image without alt attribute in ${file}: ${image.slice(0, 180)}`);
    }
  }
}

function addFeedDiscovery(html, lang) {
  const href = lang === "en" ? "/en/feed.xml" : "/feed.xml";
  if (html.includes(`href="${href}"`) && html.includes('type="application/rss+xml"')) return html;
  const title = lang === "en" ? "BOWDY LABS Insights — English" : "BOWDY LABS Insights";
  return html.replace("</head>", `  <link rel="alternate" type="application/rss+xml" title="${title}" href="${href}">\n</head>`);
}

function addDatePublished(html, publishedIso, file) {
  let foundArticle = false;
  const next = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (whole, raw) => {
    const parsed = JSON.parse(raw);
    const graph = parsed["@graph"] || [];
    for (const node of graph) {
      if (node?.["@type"] === "Article") {
        node.datePublished = publishedIso;
        foundArticle = true;
      }
    }
    return `<script type="application/ld+json">${JSON.stringify(parsed).replaceAll("<", "\\u003c")}</script>`;
  });
  if (!foundArticle) throw new Error(`Article schema not found in ${file}`);
  return next;
}

function rssItem({ title, path, description, publishedRfc }) {
  const url = `${site.url}${path}`;
  return `<item><title>${xmlEsc(title)}</title><link>${xmlEsc(url)}</link><guid isPermaLink="true">${xmlEsc(url)}</guid><pubDate>${publishedRfc}</pubDate><description>${xmlEsc(description)}</description></item>`;
}

function buildFeed({ lang, path, title, description, items }) {
  const feedUrl = `${site.url}${path}`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n<title>${xmlEsc(title)}</title>\n<link>${xmlEsc(site.url + (lang === "en" ? "/en/insights/" : "/insights/"))}</link>\n<description>${xmlEsc(description)}</description>\n<language>${lang === "en" ? "en" : "ar-SA"}</language>\n<atom:link href="${xmlEsc(feedUrl)}" rel="self" type="application/rss+xml"/>\n<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n${items.join("\n")}\n</channel>\n</rss>\n`;
}

const htmlFiles = await listHtmlFiles(dist);
let decorativeImages = 0;
for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");
  const before = html;
  html = makeEmptyAltExplicitlyDecorative(html);
  if (html !== before) decorativeImages += (html.match(/\brole="presentation"\s+aria-hidden="true"|\baria-hidden="true"\s+role="presentation"/g) || []).length;
  assertEveryImageHasAlt(html, relative(dist, file));

  const rel = relative(dist, file).replaceAll("\\", "/");
  if (rel === "index.html" || rel.startsWith("insights/")) html = addFeedDiscovery(html, "ar");
  if (rel === "en/index.html" || rel.startsWith("en/insights/")) html = addFeedDiscovery(html, "en");

  await writeFile(file, html, "utf8");
}

const waves = [
  { guides: insightGuides, publishedIso: wave1PublishedIso },
  { guides: wave2Guides, publishedIso: wave2PublishedIso },
];

for (const { guides, publishedIso } of waves) {
  for (const guide of guides) {
    for (const lang of ["ar", "en"]) {
      const file = htmlPath(lang, guide.slug);
      let html = await readFile(file, "utf8");
      html = addDatePublished(html, publishedIso, relative(dist, file));
      if (!html.includes(`"datePublished":"${publishedIso}"`)) {
        throw new Error(`datePublished assertion failed for ${relative(dist, file)}`);
      }
      await writeFile(file, html, "utf8");
    }
  }
}

const wave2Rfc = new Date(wave2PublishedIso).toUTCString();
const wave1Rfc = new Date(wave1PublishedIso).toUTCString();

const arItems = [
  ...wave2Guides.map((guide) => rssItem({ title: guide.ar.title, path: route("ar", guide.slug), description: guide.ar.description, publishedRfc: wave2Rfc })),
  ...insightGuides.map((guide) => rssItem({ title: guide.ar.title, path: route("ar", guide.slug), description: guide.ar.description, publishedRfc: wave1Rfc })),
  ...insights.map((item) => rssItem({ title: item.title, path: `/insights/${item.slug}/`, description: item.excerpt, publishedRfc: legacyPublishedRfc })),
];

const enItems = [
  ...wave2Guides.map((guide) => rssItem({ title: guide.en.title, path: route("en", guide.slug), description: guide.en.description, publishedRfc: wave2Rfc })),
  ...insightGuides.map((guide) => rssItem({ title: guide.en.title, path: route("en", guide.slug), description: guide.en.description, publishedRfc: wave1Rfc })),
];

const arFeed = buildFeed({
  lang: "ar",
  path: "/feed.xml",
  title: "BOWDY LABS Insights",
  description: site.description,
  items: arItems,
});
const enFeed = buildFeed({
  lang: "en",
  path: "/en/feed.xml",
  title: "BOWDY LABS AI Insights",
  description: "Bilingual BOWDY LABS research and practical guides on AI agents, enterprise RAG, Arabic AI, AI governance and automation in Saudi Arabia.",
  items: enItems,
});

await writeFile(join(dist, "feed.xml"), arFeed, "utf8");
await mkdir(join(dist, "en"), { recursive: true });
await writeFile(join(dist, "en", "feed.xml"), enFeed, "utf8");

for (const guide of [...insightGuides, ...wave2Guides]) {
  if (!arFeed.includes(`${site.url}/insights/${guide.slug}/`)) throw new Error(`Arabic RSS missing ${guide.slug}`);
  if (!enFeed.includes(`${site.url}/en/insights/${guide.slug}/`)) throw new Error(`English RSS missing ${guide.slug}`);
}
if (arFeed.includes("/insights/topics/") || enFeed.includes("/insights/topics/")) {
  throw new Error("Topic hubs must not be included in RSS feeds");
}

console.log(`Schema + alt + RSS polish: datePublished added to ${(insightGuides.length + wave2Guides.length) * 2} guide pages; Arabic RSS ${arItems.length} items; English RSS ${enItems.length} items; decorative image semantics normalized across ${htmlFiles.length} HTML pages.`);
