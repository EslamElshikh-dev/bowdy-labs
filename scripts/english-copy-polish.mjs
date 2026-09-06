import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const servicesDir = join(root, "dist", "en", "services");

for (const entry of await readdir(servicesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = join(servicesDir, entry.name, "index.html");
  let html;
  try {
    html = await readFile(file, "utf8");
  } catch {
    continue;
  }

  html = html.replace(/<h2>Start a ([^<]+) project<\/h2>/g, "<h2>Start your $1 project</h2>");
  await writeFile(file, html, "utf8");

  if (html.includes("<h2>Start a ")) {
    throw new Error(`Unpolished English CTA remains in ${entry.name}`);
  }
}

console.log("Polished English service CTA grammar.");
