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
  test(`${lang}: published pricing and structured offers agree on setup, recurring and optional charges`, async () => {
    const html = await read(`dist/${prefix}pricing/index.html`);
    const graph = graphOf(html);
    const services = graph.filter(n => n["@type"] === "Service");
    assert.equal(services.length, 3);
    const launch = services.find(n => n["@id"].endsWith("-launch")).offers;
    assert.deepEqual(launch.priceSpecification.priceComponent.map(c => c.price), [1500, 690]);
    assert.equal(launch.priceSpecification.priceComponent[1].billingDuration, "P1M");
    const build = services.find(n => n["@id"].endsWith("-build")).offers;
    assert.equal(build.priceSpecification.minPrice, 7500);
    assert.equal(build.priceSpecification.maxPrice, undefined, "typical range must not become a contractual price cap");
    assert.equal(build.addOn.priceSpecification.price, 990);
    assert.equal(services.find(n => n["@id"].endsWith("-scale")).offers.priceSpecification.minPrice, 30000);
    for (const service of services) assert.equal(service.offers.priceCurrency, "SAR");
    const components = launch.priceSpecification.priceComponent;
    assert.ok(components.every(c => c.valueAddedTaxIncluded));
    assert.equal(graph.find(n => n["@type"] === "FAQPage").mainEntity.length, 6);
    for (const price of ["690", "1,500", "7,500", "990", "30,000"]) assert.ok(mainOf(html).includes(price));
    assert.ok(mainOf(html).includes('id="addons"'));
    assert.ok(!/1,200|2,500|450|250|15%/.test(mainOf(html)), "unapproved add-on prices must not ship");
  });
  test(`${lang}: visitor can reach pricing and a correctly localised trial request`, async () => {
    const home = await read(`dist/${prefix}index.html`);
    const pricing = await read(`dist/${prefix}pricing/index.html`);
    if (lang === "en") {
      const count = value => mainOf(value).replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
      assert.ok(count(home) < count(await read("dist/index.html")), "English home should be more concise than Arabic");
    }
    assert.equal((mainOf(home).match(/class="commercial-agent"/g) || []).length, 4);
    assert.equal((mainOf(home).match(/<summary>/g) || []).length, 3);
    assert.ok(home.includes(`href="/${prefix}pricing/"`));
    assert.ok(pricing.includes(`href="/${prefix}contact/?service=ai-agents&intent=trial&plan=launch#trial"`));
    assert.ok(!/خلال 24 ساعة|in 24 hours|data never leaves|بياناتك ما تطلع/.test(mainOf(home)));
    assert.ok(!/THREE CORE SYSTEMS|iconography-section|INTELLIGENCE\. INNOVATION\. IMPACT\./.test(mainOf(home)));
    assert.ok(!/OpenAI|NVIDIA|AWS/.test(mainOf(home)));
    assert.ok(!/70%|\+__|معروف|رقم ___/.test(mainOf(home)));
    assert.equal((home.match(/aria-current="page"/g) || []).length, 2);
    assert.equal((pricing.match(new RegExp(`href="/${prefix}pricing/" aria-current="page"`, "g")) || []).length, 2);
    const contact = await read(`dist/${prefix}contact/index.html`);
    assert.ok(contact.includes("data-trial-form"));
    for (const name of ["name", "phone", "businessWhatsapp", "task"]) assert.ok(contact.includes(`name="${name}"`));
    const privacy = await read(`dist/${prefix}privacy/index.html`);
    assert.ok(privacy.includes("Cloudflare Workers AI"));
    assert.ok(privacy.includes("commercial-legal-additions"));
  });
}

test("both pricing routes have reciprocal alternates, canonicals and sitemap entries", async () => {
  const sitemap = await read("dist/sitemap.xml");
  for (const prefix of ["", "en/"]) {
    const html = await read(`dist/${prefix}pricing/index.html`);
    assert.ok(html.includes(`<link rel="canonical" href="https://bowdylabs.com/${prefix}pricing/">`));
    assert.ok(sitemap.includes(`<loc>https://bowdylabs.com/${prefix}pricing/</loc>`));
    for (const [hreflang, url] of [["ar-SA", "https://bowdylabs.com/pricing/"], ["en", "https://bowdylabs.com/en/pricing/"], ["en-SA", "https://bowdylabs.com/en/pricing/"], ["x-default", "https://bowdylabs.com/pricing/"]]) {
      assert.ok(html.includes(`hreflang="${hreflang}" href="${url}"`));
    }
  }
});

test("service catalogs cover the same nine visible capabilities in both languages", async () => {
  for (const prefix of ["", "en/"]) {
    const html = await read(`dist/${prefix}services/index.html`);
    const graph = graphOf(html);
    const services = graph.filter(n => n["@type"] === "Service");
    assert.equal(services.length, 9);
    assert.equal(graph.find(n => n["@type"] === "OfferCatalog").itemListElement.length, 9);
    for (const service of services) assert.ok(mainOf(html).includes(service.name));
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
  assert.equal(unknown.events[0][1].data.plan, "unspecified");
  assert.equal(unknown.events[0][1].data.language, "en");
});

test("pricing page measurement fires once per load and excludes contact content", async () => {
  const source = await read("assets/js/analytics.js");
  for (const page of ["/pricing/", "/en/pricing/"]) {
    const calls = [];
    vm.runInNewContext(source, { window: { location: { pathname: page }, va: (...args) => calls.push(args), dispatchEvent() {} }, document: { documentElement: { lang: page.startsWith("/en") ? "en" : "ar" }, addEventListener() {}, querySelector: () => null }, CustomEvent: class {} });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1].name, "pricing_view");
    assert.equal(calls[0][1].data.page, page);
  }
});
