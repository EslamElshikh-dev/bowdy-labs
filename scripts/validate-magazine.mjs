import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { magazine, magazineArticles, articlePath, articlePublishedAt, articleModifiedAt, articleShareImage } from "../src/riyadh-tech-content.mjs";
import { magazineExtraPageModels } from "../src/riyadh-tech-sections.mjs";
import { magazineSections, sectionPath, sourcePath, articleSourceIds } from "../src/riyadh-tech-routing.mjs";
import { newsSources } from "../src/riyadh-tech-news.mjs";
import { site } from "../src/content.mjs";

const root = join(dirname(dirname(fileURLToPath(import.meta.url))), "dist");
const extraPages = magazineExtraPageModels();
const routes = [magazine.path, ...magazineArticles.map(articlePath), ...extraPages.map(page => page.path)];
assert.equal(routes.length, new Set(routes).size, "unique magazine routes");
const unindexed = new Set(extraPages.filter(page => !page.indexable).map(page => page.path));
const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const documents = new Map();

for (const route of routes) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  documents.set(route, html);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${route}: exactly one H1`);
  assert.ok(html.includes('<html lang="ar" dir="rtl">'), `${route}: Arabic RTL`);
  assert.ok(html.includes(`<link rel="canonical" href="${site.url}${route}">`), `${route}: canonical`);
  assert.equal(sitemap.includes(`<loc>${site.url}${route}</loc>`), !unindexed.has(route), `${route}: sitemap matches indexing policy`);
  assert.equal(html.includes('content="noindex'), unindexed.has(route), `${route}: robots matches indexing policy`);
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
  assert.ok(html.includes('class="rt-navigation"'), `${route}: magazine navigation`);
  for (const section of magazineSections) assert.ok(html.includes(`href="${sectionPath(section.id)}"`), `${route}: section route ${section.id}`);
  const article = magazineArticles.find(a => articlePath(a) === route);
  if (article) {
    const node = graphs.find(n => n["@type"] === (article.kind === "news" ? "NewsArticle" : "BlogPosting"));
    assert.ok(node, `${route}: correct editorial schema`);
    assert.equal(node.datePublished, articlePublishedAt(article), `${route}: actual magazine publication date`);
    assert.equal(node.dateModified, articleModifiedAt(article), `${route}: actual modification date`);
    assert.equal(imagePath, articleShareImage(article), `${route}: stable social image`);
    assert.equal(node.mainEntityOfPage["@id"], `${site.url}${route}#webpage`, `${route}: article linked to page`);
    if (article.kind === "news") {
      assert.ok(article.eventDate < articlePublishedAt(article), `${route}: source event precedes publication`);
      assert.ok(html.includes(`datetime="${article.eventDate}"`), `${route}: source event date visible`);
      assert.ok(article.sources.length, `${route}: attributed news`);
    }
    for (const source of article.sources) assert.ok(html.includes(`href="${source.url}"`), `${route}: original source visible`);
    if (article.automated) {
      assert.ok(html.includes('class="rt-auto-disclosure"'), `${route}: automatic publication disclosed`);
      assert.ok(html.includes('دون مراجعة بشرية قبل النشر'), `${route}: review status clear`);
      assert.equal(node.author["@id"], `${site.url}${magazine.path}#automatic-desk`, `${route}: automatic author identified`);
    }
    assert.ok(html.includes(`data-save-article="${route}"`), `${route}: save control`);
    assert.ok(html.includes("data-reader-tools hidden"), `${route}: reader tools progressively enhanced`);
    assert.ok(html.includes("data-reading-progress hidden"), `${route}: reading progress progressively enhanced`);
    for (const sourceId of articleSourceIds(article)) assert.ok(html.includes(`href="${sourcePath({id:sourceId})}"`), `${route}: source profile link`);
    assert.ok(html.includes("https://wa.me/?text="), `${route}: WhatsApp sharing`);
    assert.ok(html.includes("https://www.linkedin.com/sharing/share-offsite/?url="), `${route}: LinkedIn sharing`);
  }
}

const index = documents.get(magazine.path);
assert.equal((index.match(/ data-magazine-card /g) ?? []).length, Math.min(12, magazineArticles.length), "latest stories rendered without JavaScript");
assert.ok(index.includes("data-magazine-search-form hidden"), "search progressively enhanced");
assert.ok(index.includes("data-magazine-filters hidden"), "filters progressively enhanced");
assert.ok(index.includes('role="status" aria-live="polite"'), "accessible result announcements");
assert.ok(index.includes('id="news-sources"'), "official sources are visible");
assert.ok(index.includes('رصد ونشر تلقائي · كل ساعة'), "hourly publication explained");
for (const [route, html] of documents) {
  for (const match of html.matchAll(/href="(\/riyadh-tech\/[^"#?]*)#([^"?]+)"/g)) {
    assert.ok(documents.get(match[1])?.includes(`id="${match[2]}"`), `${route}: linked anchor ${match[1]}#${match[2]}`);
  }
}
const search = documents.get(`${magazine.path}search/`);
assert.equal((search.match(/ data-magazine-card /g) ?? []).length, magazineArticles.length, "search contains all published stories");
for (const control of ["data-magazine-source", "data-magazine-sort", "data-search-more"]) assert.ok(search.includes(control), `full search: ${control}`);
const saved = documents.get(`${magazine.path}saved/`);
assert.equal((saved.match(/ data-saved-card=/g) ?? []).length, magazineArticles.length, "every article can appear in reading list");
for (const source of newsSources) {
  const route = sourcePath(source);
  const html = documents.get(route);
  const matches = magazineArticles.filter(article => articleSourceIds(article).includes(source.id));
  assert.equal(unindexed.has(route), matches.length === 0, `${route}: empty source profile excluded from search indexes`);
  if (matches.length === 0) assert.ok(html.includes("المصدر جاهز للمتابعة"), `${route}: useful empty state`);
  assert.ok(html.includes(`href="${source.homepage}"`), `${route}: official source link`);
}
const feed = await readFile(join(root, "riyadh-tech/feed.xml"), "utf8");
assert.equal((feed.match(/<item>/g) ?? []).length, magazineArticles.length, "RSS includes every story");
for (const article of magazineArticles) assert.ok(feed.includes(`${site.url}${articlePath(article)}`), "RSS canonical URLs");
for (const route of ["", "en/"]) {
  const home = await readFile(join(root, route, "index.html"), "utf8");
  assert.ok(home.includes('href="/riyadh-tech/"'), `${route || "/"}: magazine navigation`);
}
assert.ok((await readFile(join(root, "llms.txt"), "utf8")).includes(`${site.url}${magazine.path}`), "AI discovery document");
console.log(`Magazine validated: ${routes.length} pages, ${magazineArticles.length} stories, source dates, JSON-LD, internal links, anchors, RSS, social images and progressive enhancement.`);
