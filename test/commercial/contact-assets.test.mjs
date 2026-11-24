import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = file => readFile(new URL("../../dist/" + file, import.meta.url), "utf8");

for (const language of ["ar", "en"]) {
  test(`${language}: built contact pages request the updated immutable WhatsApp scripts`, async () => {
    const prefix = language === "en" ? "en/" : "";
    const html = await read(prefix + "contact/index.html");
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
    const changedScripts = ["main.js", ...(language === "en" ? ["contact-en.js"] : [])];
    for (const file of changedScripts) {
      assert.ok(scripts.includes(`/assets/js/${file}?v=20261124-contact1`), `${file} must bypass previously cached immutable versions`);
      const source = await read("assets/js/" + file);
      assert.ok(source.includes(file === "main.js" ? "فتح الرسالة يدويًا" : "Open your message manually"));
    }
  });
}
