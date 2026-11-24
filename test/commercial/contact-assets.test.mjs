import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = file => readFile(new URL("../../dist/" + file, import.meta.url), "utf8");

for (const language of ["ar", "en"]) {
  test(`${language}: built contact pages request the updated immutable WhatsApp scripts`, async () => {
    const prefix = language === "en" ? "en/" : "";
    const html = await read(prefix + "contact/index.html");
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
    assert.ok(scripts.includes("/assets/js/analytics.js?v=20261124-contact2"));
    const changedScripts = ["main.js", ...(language === "en" ? ["contact-en.js"] : [])];
    for (const file of changedScripts) {
      assert.ok(scripts.includes(`/assets/js/${file}?v=20261124-contact2`), `${file} must bypass previously cached immutable versions`);
      const source = await read("assets/js/" + file);
      assert.ok(source.includes(file === "main.js" ? "فتح الرسالة يدويًا" : "Open your message manually"));
    }
  });
}

for (const prefix of ["", "en/"]) {
  test(prefix + " service contact links preserve the service and lead to the brief", async () => {
    const messages = new Set();
    for (const slug of ["crm-development", "web-development", "ai-chatbots", "booking-systems", "business-dashboards"]) {
      const html = await read(prefix + "services/" + slug + "/index.html");
      assert.ok(html.includes('href="/' + prefix + 'contact/?service=' + slug + '#project-brief"'), slug);
      const href = html.match(/class="floating-whatsapp" href="([^"]+)"/)[1];
      const url = new URL(href);
      assert.equal(url.hostname, "wa.me");
      assert.equal(url.pathname, "/966598447530");
      const message = url.searchParams.get("text");
      assert.ok(message && !message.includes("undefined"));
      messages.add(message);
    }
    assert.equal(messages.size, 5);
  });
}
