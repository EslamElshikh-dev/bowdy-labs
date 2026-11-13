import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { businessSystems } from "../../src/business-systems-content.mjs";

const read = file => readFile(new URL("../../dist/" + file, import.meta.url), "utf8");
for (const lang of ["ar", "en"]) {
  const prefix = lang === "en" ? "en/" : "";
  test(lang + ": independent service pages have reciprocal language links, visible FAQs and matching Service data", async () => {
    for (const service of businessSystems) {
      const path = prefix + "services/" + service.slug + "/";
      const html = await read(path + "index.html");
      const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
      assert.ok(html.includes('rel="canonical" href="https://bowdylabs.com/' + path + '"'));
      assert.ok(html.includes('hreflang="ar-SA" href="https://bowdylabs.com/services/' + service.slug + '/"'));
      assert.ok(html.includes('hreflang="en-SA" href="https://bowdylabs.com/en/services/' + service.slug + '/"'));
      assert.ok(html.includes('class="language-link" href="/' + (lang === "en" ? "" : "en/") + "services/" + service.slug + '/"'));
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
      assert.equal(graph.filter(n => n["@type"] === "Service").length, 1);
      assert.equal(graph.find(n => n["@type"] === "Service").name, service[lang].name);
      assert.equal(graph.find(n => n["@type"] === "FAQPage").mainEntity.length, service[lang].faq.length);
      for (const [question] of service[lang].faq) assert.ok(html.includes(question));
      assert.ok(html.includes('data-business-demo="' + service.key + '"'));
      assert.ok(html.includes("business-systems.js?v=20261113-2"));
      assert.ok(!/\"price(?:Range|Currency)?\"\s*:/.test(JSON.stringify(graph)));
    }
  });
  test(lang + ": the hub, homepage and contact form expose all four independent services", async () => {
    const hub = await read(prefix + "services/index.html");
    const home = await read(prefix + "index.html");
    const contact = await read(prefix + "contact/index.html");
    for (const service of businessSystems) {
      assert.ok(hub.includes('href="/' + prefix + "services/" + service.slug + '/"'));
      assert.ok(home.includes('href="/' + prefix + "services/" + service.slug + '/"'));
      assert.ok(contact.includes('<option value="' + service.slug + '">'));
    }
    assert.ok(contact.includes('id="project-brief"'));
    assert.ok(contact.includes("data-contact-plan-copy"));
    assert.ok(hub.includes("data-business-planner"));
    assert.equal((hub.match(/data-studio-select=/g) || []).length, 4);
    assert.equal((hub.match(/data-studio-panel=/g) || []).length, 4);
    assert.equal((hub.match(/data-studio-panel="[^"]+"[^>]* hidden/g) || []).length, 3);
    const studioIds = [...hub.matchAll(/id="(studio-[^"]+)"/g)].map(m => m[1]);
    assert.equal(studioIds.length, new Set(studioIds).size, "studio labels and controls must be unambiguous");
    assert.ok(hub.includes('data-studio-status role="status"'));
    assert.ok(home.includes('id="governance"'));
  });
}
test("all new public service routes are discoverable in sitemap and llms", async () => {
  const [sitemap, llms] = await Promise.all([read("sitemap.xml"), read("llms.txt")]);
  for (const prefix of ["", "en/"]) for (const service of businessSystems) {
    const url = "https://bowdylabs.com/" + prefix + "services/" + service.slug + "/";
    assert.ok(sitemap.includes("<loc>" + url + "</loc>"));
    assert.ok(llms.includes(url));
  }
});
