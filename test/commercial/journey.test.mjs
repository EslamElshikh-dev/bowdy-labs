import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../../", import.meta.url);
const read = file => readFile(new URL(file, root), "utf8");
const graphOf = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
const mainOf = html => html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];

for (const lang of ["ar", "en"]) {
  const prefix = lang === "en" ? "en/" : "";
  test(`${lang}: original homepage design retains governance and localised contact paths`, async () => {
    const home = await read(`dist/${prefix}index.html`);
    const main = mainOf(home);
    for (const marker of ["hero-grid", "hero-visual", "bowdy-intelligence-1200.webp", "services-section", "cta-panel", 'id="governance"']) assert.ok(main.includes(marker), marker);
    assert.ok(!/commercial-hero|data-commercial-home|commercial-plans|id="pricing"/.test(main));
    assert.ok(!home.includes("/assets/css/commercial.css"), "homepage uses the original stylesheet");
    assert.ok(main.includes("NCA") && main.includes("PDPL"));
    assert.ok(main.includes(`href="/${prefix}privacy/"`));
    assert.ok(main.includes(`href="/${prefix}contact/"`));
    assert.equal((home.match(/<h1[ >]/g) || []).length, 1);
    assert.equal((home.match(/aria-current="page"/g) || []).length, 2);
    assert.ok(home.includes(`rel="canonical" href="https://bowdylabs.com/${prefix}"`));
    assert.ok(home.includes('hreflang="ar-SA" href="https://bowdylabs.com/"'));
    assert.ok(home.includes('hreflang="en" href="https://bowdylabs.com/en/"'));
    assert.ok(home.includes('hreflang="en-SA" href="https://bowdylabs.com/en/"'));
    const contact = await read(`dist/${prefix}contact/index.html`);
    assert.ok(contact.includes("data-trial-form"));
    for (const name of ["name", "phone", "businessWhatsapp", "task"]) assert.ok(contact.includes(`name="${name}"`));
    assert.ok(!contact.includes('name="budget"'));
    const privacy = await read(`dist/${prefix}privacy/index.html`);
    assert.ok(privacy.includes("Cloudflare Workers AI"));
    assert.ok(privacy.includes("commercial-legal-additions"));
    const terms = await read(`dist/${prefix}terms/index.html`);
    assert.ok(terms.includes("NCA") && terms.includes("PDPL"));
    assert.ok(!/Paid Launch|990|رسوم تأسيس انطلق/.test(mainOf(terms)));
  });
}

test("pricing pages are absent and legacy URLs redirect to the matching contact language", async () => {
  const { access } = await import("node:fs/promises");
  const config = JSON.parse(await read("vercel.json"));
  for (const prefix of ["", "en/"]) {
    await assert.rejects(access(new URL(`dist/${prefix}pricing/index.html`, root)), { code: "ENOENT" });
    // Both spellings were published; trailingSlash must not strand old links on 404.
    for (const suffix of ["", "/"]) {
      const source = `/${prefix}pricing${suffix}`;
      assert.deepEqual(config.redirects.find(r => r.source === source), { source, destination: `/${prefix}contact/`, permanent: true });
    }
  }
  for (const file of ["dist/sitemap.xml", "dist/llms.txt"]) assert.ok(!/\/(?:en\/)?pricing\//.test(await read(file)));
});

test("public pages contain no pricing links, plan sections or structured prices", async () => {
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(new URL("dist/", root), { recursive: true });
  for (const file of files.filter(f => f.endsWith(".html"))) {
    const html = await read(`dist/${file}`);
    assert.ok(!/href=["'][^"']*\/(?:en\/)?pricing\//.test(html), file);
    assert.ok(!/commercial-plan|data-pricing-page|id="pricing"/.test(html), file);
    for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      const graph = JSON.parse(match[1]);
      assert.ok(!/"(?:price|priceRange|priceCurrency|priceSpecification|minPrice|maxPrice)"\s*:/.test(JSON.stringify(graph)), file);
    }
  }
});

test("service catalogs cover the same thirteen visible capabilities in both languages", async () => {
  for (const prefix of ["", "en/"]) {
    const html = await read(`dist/${prefix}services/index.html`);
    const graph = graphOf(html);
    const services = graph.filter(n => n["@type"] === "Service");
    assert.equal(services.length, 13);
    assert.equal(graph.find(n => n["@type"] === "OfferCatalog").itemListElement.length, 13);
    for (const service of services) assert.ok(mainOf(html).replaceAll("&amp;", "&").includes(service.name));
  }
});

async function trialHarness({ language = "ar", query = "?service=ai-agents&intent=trial&plan=launch", phone = "٠٥٠ ١٢٣ ٤٥٦٧", task = "أحتاج تجربة الرد على أسئلة الخدمات فقط" } = {}) {
  const events = [];
  const opens = [];
  let submit;
  const field = value => ({ value, error: "", addEventListener() {}, setCustomValidity(error) { this.error = error; } });
  const elements = { name: field("اسم تجريبي"), phone: field(phone), businessWhatsapp: field("+966 50 123 4567"), task: field(task) };
  const fallback = { hidden: true };
  const status = { textContent: "" };
  const section = { hidden: true, scrollIntoView() {} };
  const standard = { hidden: false };
  const form = { elements, reportValidity: () => Object.values(elements).every(e => !e.error), addEventListener(name, fn) { if (name === "submit") submit = fn; }, querySelector: selector => selector === "[data-trial-fallback]" ? fallback : status };
  const window = { location: { search: query, hash: "#trial" }, va: (...args) => events.push(args), dispatchEvent() {}, open: (...args) => { opens.push(args); return null; } };
  const document = { documentElement: { lang: language }, querySelector: selector => selector === "[data-trial-section]" ? section : selector === "[data-standard-contact]" ? standard : form };
  vm.runInNewContext(await read("assets/js/trial.js"), { document, window, URLSearchParams, requestAnimationFrame: f => f(), CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } } });
  return { submit: () => submit?.({ preventDefault() {} }), section, fallback, status, events, opens, elements };
}

test("trial handoff normalises Arabic numbers and survives blocked popup without claiming delivery", async () => {
  const h = await trialHarness();
  h.submit();
  assert.equal(h.section.hidden, false);
  assert.equal(h.fallback.hidden, false);
  const message = new URL(h.fallback.href).searchParams.get("text");
  assert.ok(message.includes("0501234567"));
  assert.ok(message.includes("+966501234567"));
  assert.equal(h.opens.length, 1);
  assert.ok(h.status.textContent.includes("راجعه وأرسله"));
  assert.equal(h.events[0][1].name, "trial_request");
  const payload = h.events[0][1].data;
  assert.equal(payload.delivery, "whatsapp_handoff");
  assert.ok(!JSON.stringify(payload).includes("0501234567"));
  assert.ok(!JSON.stringify(payload).includes(h.elements.task.value));
  assert.ok(!JSON.stringify(payload).includes(h.elements.name.value));
});

test("invalid phones prevent navigation and conversion events", async () => {
  const h = await trialHarness({ phone: "bad-number" });
  h.submit();
  assert.equal(h.opens.length, 0);
  assert.equal(h.events.length, 0);
  assert.equal(h.fallback.hidden, true);
  assert.ok(h.elements.phone.error);
});

test("trial intake only activates for trial intent and ignores unknown plan parameters", async () => {
  const normal = await trialHarness({ query: "?service=ai-agents" });
  normal.submit();
  assert.equal(normal.section.hidden, true);
  assert.equal(normal.events.length, 0);
  const unknown = await trialHarness({ language: "en", query: "?intent=trial&plan=private-customer-info" });
  unknown.submit();
  assert.equal(unknown.events[0][1].data.plan, undefined);
  assert.ok(!new URL(unknown.fallback.href).searchParams.get("text").includes("Plan:"));
  assert.equal(unknown.events[0][1].data.language, "en");
});

test("assistant sources use scoped proposals without historical package prices", async () => {
  for (const file of ["assets/js/bowdy-assistant.js", "api/bowdy.js"]) {
    const source = await read(file);
    assert.ok(!/1,500|7,500|30,000|690|990/.test(source));
    assert.ok(!/https:\/\/bowdylabs\.com\/(?:en\/)?pricing\//.test(source));
  }
});
