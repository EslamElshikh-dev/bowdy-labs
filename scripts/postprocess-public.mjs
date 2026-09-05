import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url);
const buildDate = new Date().toISOString().slice(0, 10);

async function walk(dirUrl) {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dirUrl);
    if (entry.isDirectory()) files.push(...(await walk(child)));
    else files.push(child);
  }
  return files;
}

const htmlFiles = (await walk(dist)).filter((url) => url.pathname.endsWith(".html"));

for (const fileUrl of htmlFiles) {
  let html = await readFile(fileUrl, "utf8");

  html = html
    .replaceAll("ضمان على كافة أعمالنا", "ضمان جودة التنفيذ")
    .replaceAll(
      "كلمتنا عهد، وأعمالنا مضمونة: سلّمنا المهمة، واستمتع بنتيجة مضمونة 100٪ تدعم طموحك.",
      "نلتزم بالنطاق ومعايير القبول المتفق عليها، ونراجع المخرجات قبل التسليم ونعالج العيوب الواقعة ضمن نطاق المشروع."
    )
    .replaceAll(
      "بصفتنا شركة ذكاء اصطناعي سعودية رائدة،",
      "بصفتنا مختبرًا تقنيًا سعوديًا متخصصًا في حلول الذكاء الاصطناعي للأعمال،"
    )
    .replaceAll('"dateModified":"2026-08-16"', `"dateModified":"${buildDate}"`);

  await writeFile(fileUrl, html, "utf8");
}

const sitemapUrl = new URL("sitemap.xml", dist);
let sitemap = await readFile(sitemapUrl, "utf8");
sitemap = sitemap
  .replace(/\s*<url><loc>https:\/\/bowdylabs\.com\/alarjancrm\/<\/loc>[\s\S]*?<\/url>/g, "")
  .replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${buildDate}</lastmod>`);
await writeFile(sitemapUrl, sitemap, "utf8");

console.log(`Post-processed public output for ${buildDate}: trust copy, metadata dates, and sitemap privacy.`);
