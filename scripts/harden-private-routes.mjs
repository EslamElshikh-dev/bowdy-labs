import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content.mjs";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sitemapPath = join(projectRoot, "dist", "sitemap.xml");
const privateLocation = `<loc>${site.url}/alarjancrm/</loc>`;
const sitemap = await readFile(sitemapPath, "utf8");
const lines = sitemap.split("\n");
const matches = lines.filter((line) => line.includes(privateLocation)).length;

if (matches > 1) {
  throw new Error("Expected at most one private Alarjan CRM entry in the generated sitemap.");
}

if (matches === 1) {
  const filteredLines = lines.filter((line) => !line.includes(privateLocation));
  await writeFile(sitemapPath, filteredLines.join("\n"), "utf8");
}
