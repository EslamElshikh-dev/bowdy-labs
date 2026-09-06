import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const pages = [
  {
    path: join(dist, "insights", "index.html"),
    title: "مركز معرفة الذكاء الاصطناعي | BOWDY LABS",
  },
  {
    path: join(dist, "en", "insights", "index.html"),
    title: "AI Insights & Topic Clusters | BOWDY LABS",
  },
];

function collapseDuplicateTags(html) {
  return html.replace(
    /(<div class="case-study-tags">)(<span>([^<]+)<\/span>)\2(<\/div>)/g,
    '$1$2$4',
  );
}

for (const page of pages) {
  let html = await readFile(page.path, "utf8");
  html = collapseDuplicateTags(html)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${page.title}">`)
    .replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${page.title}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${page.title}">`);
  await writeFile(page.path, html, "utf8");

  const output = await readFile(page.path, "utf8");
  if (!output.includes(`<title>${page.title}</title>`)) throw new Error(`Insights SEO title polish failed: ${page.path}`);
  if (/<div class="case-study-tags"><span>([^<]+)<\/span><span>\1<\/span><\/div>/.test(output)) {
    throw new Error(`Duplicate Insights topic tags remain: ${page.path}`);
  }
}

console.log("Polished bilingual Insights index SEO titles and removed duplicate topic tags.");
