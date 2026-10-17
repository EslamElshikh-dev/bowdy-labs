import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { magazine, magazineArticles, articlePath } from "../src/riyadh-tech-content.mjs";
import { site } from "../src/content.mjs";

const root = join(dirname(dirname(fileURLToPath(import.meta.url))), "dist");
const routes = [magazine.path, ...magazineArticles.map(articlePath)];
const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const documents = new Map();

for (const route of routes) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  documents.set(route, html);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${route}: exactly one H1`);
  assert.ok(html.includes('<html lang="ar" dir="rtl">'), `${route}: Arabic RTL`);
  assert.ok(html.includes(`<link rel="canonical" href="${site.url}${route}">`), `${route}: canonical`);
  assert.ok(sitemap.includes(`<loc>${site.url}${route}</loc>`), `${route}: sitemap discovery`);
  assert.ok(!html.includes('content="noindex'), `${route}: indexable`);
  assert.ok(html.includes('/assets/css/riyadh-tech.css?'), `${route}: magazine stylesheet`);
  assert.ok(html.includes('/assets/js/riyadh-tech.js?'), `${route}: magazine interactions`);
  assert.ok(html.includes('href="/riyadh-tech/feed.xml"'), `${route}: RSS discovery`);
  assert.ok(html.includes('floating-action-label'), `${route}: existing contact controls`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${route}: unique DOM IDs`);
  const imagePath = html.match(/<meta property="og:image" content="https:\/\/bowdylabs.com([^"]+)"/)?.[1];
  assert.ok(imagePath?.startsWith("/assets/og/riyadh-tech"), `${route}: dedicated social image`);
  const image = await readFile(join(root, imagePath.slice(1)));
  assert.equal(image.toString("hex", 0, 8), "89504e470d0a1a0a", `${route}: PNG social image`);
  assert.equal(image.readUInt32BE(16), 1200, `${route}: social image width`);
  assert.equal(image.readUInt32BE(20), 630, `${route}: social image height`);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const path = match[1];
    if (path.startsWith("/_vercel/")) continue; // Vercel injects these routes at runtime.
    await access(join(root, path.slice(1), ...(path.endsWith("/") ? ["index.html"] : [])));
  }
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), `${route}: valid anchor #${match[1]}`);
  const graphs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1])["@graph"] ?? []);
  assert.ok(graphs.some(n => n["@type"] === "Periodical" && n.name === magazine.name), `${route}: magazine identity`);
  assert.ok(graphs.some(n => n["@type"] === "BreadcrumbList"), `${route}: breadcrumbs`);
  if (route !== magazine.path) {
    const article = magazineArticles.find(a => articlePath(a) === route);
    const node = graphs.find(n => n["@type"] === (article.kind === "news" ? "NewsArticle" : "BlogPosting"));
    assert.ok(node, `${route}: correct editorial schema`);
    assert.equal(node.datePublished, magazine.published, `${route}: actual magazine publication date`);
    assert.equal(node.mainEntityOfPage["@id"], `${site.url}${route}#webpage`, `${route}: article linked to page`);
    if (article.kind === "news") {
      assert.ok(article.eventDate < magazine.published, `${route}: source event precedes publication`);
      assert.ok(html.includes(`datetime="${article.eventDate}"`), `${route}: source event date visible`);
      assert.ok(article.sources.length, `${route}: attributed news`);
    }
    for (const source of article.sources) assert.ok(html.includes(`href="${source.url}"`), `${route}: original source visible`);
    assert.ok(html.includes("https://wa.me/?text="), `${route}: WhatsApp sharing`);
    assert.ok(html.includes("https://www.linkedin.com/sharing/share-offsite/?url="), `${route}: LinkedIn sharing`);
  }
}

const index = documents.get(magazine.path);
assert.equal((index.match(/ data-magazine-card /g) ?? []).length, magazineArticles.length, "all stories rendered without JavaScript");
assert.ok(index.includes("data-magazine-search-form hidden"), "search progressively enhanced");
assert.ok(index.includes("data-magazine-filters hidden"), "filters progressively enhanced");
assert.ok(index.includes('role="status" aria-live="polite"'), "accessible result announcements");
const feed = await readFile(join(root, "riyadh-tech/feed.xml"), "utf8");
assert.equal((feed.match(/<item>/g) ?? []).length, magazineArticles.length, "RSS includes every story");
for (const article of magazineArticles) assert.ok(feed.includes(`${site.url}${articlePath(article)}`), "RSS canonical URLs");
for (const route of ["", "en/"]) {
  const home = await readFile(join(root, route, "index.html"), "utf8");
  assert.ok(home.includes('href="/riyadh-tech/"'), `${route || "/"}: magazine navigation`);
}
assert.ok((await readFile(join(root, "llms.txt"), "utf8")).includes(`${site.url}${magazine.path}`), "AI discovery document");
console.log(`Magazine validated: ${routes.length} pages, ${magazineArticles.length} stories, source dates, JSON-LD, internal links, anchors, RSS, social images and progressive enhancement.`);
