import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const source = await readFile(new URL("../assets/js/analytics.js", import.meta.url), "utf8");
function harness() {
  const received = [];
  const window = Object.assign(new EventTarget(), { location: new URL("https://bowdylabs.com/contact/") });
  const field = value => Object.assign(new EventTarget(), { value });
  const form = Object.assign(new EventTarget(), {
    elements: { name: field("Sample Company"), goal: field("A private project brief"), service: field("crm-development") },
    contains: link => link.fallback,
  });
  const document = Object.assign(new EventTarget(), {
    documentElement: { lang: "en" }, querySelector: () => form, querySelectorAll: () => [],
  });
  for (const name of ["bowdy:analytics", "bowdy:contact-click"]) window.addEventListener(name, event => received.push(event.detail));
  vm.runInNewContext(source, { document, window, URL, URLSearchParams, crypto: webcrypto,
    CustomEvent: class extends Event { constructor(type, { detail }) { super(type); this.detail = detail; } },
  });
  function click(href, fallback = false) {
    const link = { href, fallback, closest: selector => selector === "a[href]" || (fallback && selector === ".form-status") ? link : null };
    document.dispatchEvent(Object.defineProperty(new Event("click"), "target", { value: link }));
  }
  return { form, received, click, handoff: () => form.dispatchEvent(new Event("bowdy:brief-handoff")) };
}

test("one contact click covers retry and manual handoff, with no brief content in measurement", () => {
  const h = harness();
  const wa = "https://wa.me/966598447530?text=private";
  h.handoff(); h.handoff(); h.click(wa, true); h.click(wa, true);
  assert.deepEqual(h.received.map(e => e.name || e.channel), [
    "contact_brief_completed", "whatsapp_handoff_attempt", "whatsapp", "whatsapp_fallback_click",
  ]);
  const first = h.received.find(e => e.channel).id;
  h.form.elements.goal.value = "A different project";
  h.handoff();
  const conversions = h.received.filter(e => e.channel);
  assert.equal(conversions.length, 2);
  assert.notEqual(conversions[1].id, first);
  assert.doesNotMatch(JSON.stringify(h.received), /Sample Company|private project|different project|text=/);
});

test("direct phone and WhatsApp clicks have separate IDs and coalesce rapid repeats", () => {
  const h = harness();
  for (const href of ["tel:+966598447530", "https://wa.me/966598447530"]) { h.click(href); h.click(href); }
  h.click("https://wa.me/966500000000");
  const conversions = h.received.filter(e => e.channel);
  assert.deepEqual(conversions.map(e => e.channel), ["phone", "whatsapp"]);
  assert.equal(new Set(conversions.map(e => e.id)).size, 2);
});
