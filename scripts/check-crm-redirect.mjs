import assert from "node:assert/strict";

const origin = new URL(process.argv[2] ?? "https://bowdylabs.com").origin;
const request = (path) => fetch(new URL(path, origin), {
  signal: AbortSignal.timeout(30_000),
});
const destination = "/alarjancrm/";

for (const source of ["/crm", "/crm/", "/crm/?utm_source=crm-redirect-check&gclid=redirect-check"]) {
  const response = await request(source);
  assert.equal(response.status, 200, `${source}: redirect must reach an existing page`);
  assert.ok(response.redirected, `${source}: legacy URL must redirect`);
  const final = new URL(response.url);
  assert.equal(final.origin, origin, `${source}: redirect must stay on the requested deployment`);
  assert.equal(final.pathname, destination, `${source}: redirect must reach the final private route`);
  assert.equal(final.search, new URL(source, origin).search, `${source}: query parameters must survive`);
  const robots = response.headers.get("x-robots-tag") ?? "";
  assert.match(robots, /\bnoindex\b/i, `${source}: final response must prevent indexing`);
  assert.match(robots, /\bnofollow\b/i, `${source}: private response must remain nofollow`);
  assert.match(response.headers.get("cache-control") ?? "", /\bprivate\b/i);
  assert.match(response.headers.get("cache-control") ?? "", /\bno-store\b/i);
  const html = await response.text();
  assert.match(html, /<meta\s+name="robots"\s+content="[^"]*\bnoindex\b/i);
  assert.match(html, /<meta\s+name="robots"\s+content="[^"]*\bnofollow\b/i);
  console.log(`${source} -> ${destination}: 200; query preserved; noindex; private, no-store`);
}

const sitemapResponse = await request("/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
assert.doesNotMatch(sitemap, /<loc>[^<]*\/(?:alarjancrm|crm)(?:\/|<)/i, "private CRM routes must stay out of the sitemap");

const serviceResponse = await request("/services/crm-development/");
assert.equal(serviceResponse.status, 200, "public CRM service landing page must remain available");
assert.equal(serviceResponse.redirected, false, "public CRM service landing page must remain direct");
assert.doesNotMatch(serviceResponse.headers.get("x-robots-tag") ?? "", /\bnoindex\b/i);
assert.doesNotMatch(await serviceResponse.text(), /<meta\s+name="robots"\s+content="[^"]*\bnoindex\b/i);
console.log("Private CRM routes excluded from sitemap; public CRM landing page remains direct and indexable.");
