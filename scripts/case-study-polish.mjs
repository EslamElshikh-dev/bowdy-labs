import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

const cases = [
  { slug: "tawod", arTitle: "شركة تعاود للمقاولات" },
  { slug: "ameen", arTitle: "أمين لخدمات الصيانة" },
  { slug: "alargan-crm", arTitle: "Alargan CRM — Agent-Led Proposal" },
];

const labels = new Map([
  ["Web Development ↗", "Web & Software Development ↗"],
  ["Seo ↗", "Technical SEO & Search Growth ↗"],
  ["Google Business Profile ↗", "Google Business Profile & Maps ↗"],
  ["Ai Agents ↗", "AI Agents & Intelligent Automation ↗"],
  ["Knowledge Bases ↗", "Knowledge Systems & Semantic Search ↗"],
]);

for (const item of cases) {
  const enPath = join(dist, "en", "work", item.slug, "index.html");
  let en = await readFile(enPath, "utf8");
  for (const [from, to] of labels) en = en.replaceAll(`>${from}</a>`, `>${to}</a>`);
  await writeFile(enPath, en, "utf8");

  const arPath = join(dist, "work", item.slug, "index.html");
  let ar = await readFile(arPath, "utf8");
  ar = ar
    .replace(/<meta property="og:type" content="[^"]*">/, '<meta property="og:type" content="article">')
    .replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${item.arTitle} — BOWDY LABS">`);
  await writeFile(arPath, ar, "utf8");
}

for (const item of cases) {
  const en = await readFile(join(dist, "en", "work", item.slug, "index.html"), "utf8");
  if (en.includes(">Seo ↗</a>") || en.includes(">Ai Agents ↗</a>")) throw new Error(`Unpolished capability label remains in ${item.slug}`);
  const ar = await readFile(join(dist, "work", item.slug, "index.html"), "utf8");
  if (!ar.includes('<meta property="og:type" content="article">')) throw new Error(`Arabic og:type not polished for ${item.slug}`);
  if (!ar.includes(`og:image:alt" content="${item.arTitle} — BOWDY LABS"`)) throw new Error(`Arabic OG image alt not polished for ${item.slug}`);
}

console.log("Polished case-study capability labels and Arabic social metadata.");
