import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

async function contactHarness(language, { valid = true, popupThrows = false } = {}) {
  const opens = [];
  const fields = { name: { value: "شركة & تجربة" }, service: { value: "" }, goal: { value: "ربط المبيعات\nومتابعة العملاء <مهم>" } };
  const status = {
    children: [],
    get textContent() { return this.text; },
    set textContent(value) { this.text = value; this.children = []; },
    append(child) { this.children.push(child); },
  };
  let onSubmit;
  const form = {
    elements: fields,
    reportValidity: () => valid,
    addEventListener(event, handler) { if (event === "submit") onSubmit = handler; },
    querySelector: selector => selector === ".form-status" ? status : null,
  };
  const selector = language === "ar" ? "[data-contact-form]" : "[data-contact-form-en]";
  const document = {
    querySelector: query => query === selector ? form : null,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement(tagName) { return { tagName }; },
  };
  const window = {
    location: { pathname: "/contact/", search: "?service=crm-development" },
    addEventListener() {},
    matchMedia: () => ({ matches: false }),
    open(...args) {
      opens.push(args);
      if (popupThrows) throw new Error("Popup unavailable");
      // noopener returns null even when opening succeeds; blocked popups also return null.
      return null;
    },
  };
  const source = await readFile(new URL(`../assets/js/${language === "ar" ? "main.js" : "contact-en.js"}`, import.meta.url), "utf8");
  vm.runInNewContext(source, {
    document, window, URLSearchParams,
    FormData: class { get(key) { return fields[key]?.value; } },
  });
  return { opens, fields, status, submit() { onSubmit({ preventDefault() {} }); } };
}

for (const language of ["ar", "en"]) {
  test(`${language}: WhatsApp handoff keeps the prepared brief when no window handle is returned`, async () => {
    const h = await contactHarness(language);
    assert.equal(h.fields.service.value, "crm-development");
    h.submit();
    assert.equal(h.opens.length, 1);
    const [url, target, features] = h.opens[0];
    assert.equal(target, "_blank");
    assert.equal(features, "noopener,noreferrer");
    assert.doesNotMatch(h.status.textContent, /تعذر|could not open/i);
    assert.match(h.status.textContent, language === "ar" ? /قبل الإرسال/ : /before sending/);
    const [fallback] = h.status.children;
    assert.ok(fallback, "manual link remains available if the popup is blocked");
    assert.equal(fallback.tagName, "a");
    assert.equal(fallback.href, url);
    assert.equal(fallback.target, "_blank");
    assert.equal(fallback.rel, "noopener noreferrer");
    assert.ok(fallback.textContent);
    const prepared = new URL(fallback.href);
    assert.equal(prepared.origin, "https://wa.me");
    assert.equal(prepared.pathname, "/966598447530");
    const message = prepared.searchParams.get("text");
    assert.ok(message.includes(h.fields.name.value));
    assert.ok(message.includes(h.fields.goal.value));
    assert.match(message, /CRM/);
    h.fields.goal.value = "طلب محدّث";
    h.submit();
    assert.equal(h.status.children.length, 1, "repeated submission replaces the previous link");
    assert.ok(new URL(h.status.children[0].href).searchParams.get("text").includes("طلب محدّث"));
  });

  test(`${language}: manual handoff still works if opening a window throws`, async () => {
    const h = await contactHarness(language, { popupThrows: true });
    assert.doesNotThrow(() => h.submit());
    assert.equal(h.status.children[0].href, h.opens[0][0]);
  });

  test(`${language}: invalid contact forms do not open WhatsApp or create a handoff link`, async () => {
    const h = await contactHarness(language, { valid: false });
    h.submit();
    assert.equal(h.opens.length, 0);
    assert.equal(h.status.children.length, 0);
  });
}
