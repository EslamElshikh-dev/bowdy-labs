import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content.mjs";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sitemapPath = join(projectRoot, "dist", "sitemap.xml");
const privateLocation = `<loc>${site.url}/alarjancrm/</loc>`;
const sitemap = await readFile(sitemapPath, "utf8");
const lines = sitemap.split("\n");
const filteredLines = lines.filter((line) => !line.includes(privateLocation));

if (lines.length - filteredLines.length !== 1) {
  throw new Error("Expected exactly one private Alarjan CRM entry in the generated sitemap.");
}

await writeFile(sitemapPath, filteredLines.join("\n"), "utf8");
