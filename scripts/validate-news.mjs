import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";

// No build tools or rendered pages are needed. Publishers may validate a
// complete candidate archive with --file before writing anything to GitHub.
try {
  const { values } = parseArgs({ options: { file: { type: "string" } } });
  const { validateAutomaticNews, newsSourceIds } = await import("../src/riyadh-tech-news-validation.mjs");
  const path = values.file ?? new URL("../src/data/riyadh-tech-news.json", import.meta.url);
  const data = JSON.parse(await readFile(path, "utf8"));
  const articles = validateAutomaticNews(data);
  console.log(`News data validated: ${articles.length} articles; approved source IDs: ${newsSourceIds.join(", ")}.`);
} catch (error) {
  console.error(`News data validation failed: ${error.message}`);
  process.exitCode = 1;
}
