import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "..", "dist");
const agentsDir = join(dist, "assets", "media", "agents");

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const files = await htmlFiles(dist);
const smallAgentPattern = /<img\s+src="\/assets\/media\/agents\/([a-z0-9-]+)-520\.webp"\s+width="92"\s+height="92"/g;
const neededAgents = new Set();

for (const file of files) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(smallAgentPattern)) neededAgents.add(match[1]);
}

let generatedThumbs = 0;
for (const slug of neededAgents) {
  const source = join(agentsDir, `${slug}-520.webp`);
  if (!await exists(source)) throw new Error(`Missing agent source image: ${source}`);
  for (const size of [96, 144]) {
    const target = join(agentsDir, `${slug}-${size}.webp`);
    await sharp(source)
      .resize(size, size, { fit: "cover", position: "centre" })
      .webp({ quality: 78, effort: 5 })
      .toFile(target);
    generatedThumbs += 1;
  }
}

let htmlUpdated = 0;
for (const file of files) {
  let html = await readFile(file, "utf8");
  const before = html;

  // positioning.css is supplementary/below-the-fold on the generated pages; keep main.css render-blocking to avoid FOUC/CLS.
  html = html.replace(
    '<link rel="stylesheet" href="/assets/css/positioning.css">',
    '<link rel="preload" href="/assets/css/positioning.css" as="style"><link rel="stylesheet" href="/assets/css/positioning.css" media="print" onload="this.media=\'all\'"><noscript><link rel="stylesheet" href="/assets/css/positioning.css"></noscript>',
  );

  // Prioritize the one core stylesheet that must stay blocking for visual stability.
  html = html.replace(
    '<link rel="stylesheet" href="/assets/css/main.css">',
    '<link rel="stylesheet" href="/assets/css/main.css" fetchpriority="high">',
  );

  // Replace only the compact 92px agent cards; full profile/hero artwork keeps its larger source set.
  html = html.replace(smallAgentPattern, (_full, slug) =>
    `<img src="/assets/media/agents/${slug}-96.webp" srcset="/assets/media/agents/${slug}-96.webp 96w, /assets/media/agents/${slug}-144.webp 144w" sizes="92px" width="92" height="92"`,
  );

  if (html !== before) {
    await writeFile(file, html);
    htmlUpdated += 1;
  }
}

const llms = `# BOWDY LABS — باودي لابز

> Saudi technology and AI company in Riyadh building secure AI agents, software, automation, cybersecurity, cloud, Google and search-growth systems for businesses.

## Core pages

- [BOWDY LABS — Arabic](https://bowdylabs.com/)
- [BOWDY LABS — English](https://bowdylabs.com/en/)
- [Services](https://bowdylabs.com/services/)
- [BOWDY AI Agents](https://bowdylabs.com/agents/)
- [Selected work](https://bowdylabs.com/work/)
- [Insights](https://bowdylabs.com/insights/)
- [About BOWDY LABS](https://bowdylabs.com/about/)
- [Contact](https://bowdylabs.com/contact/)

## AI knowledge clusters

- [AI Agents](https://bowdylabs.com/insights/topics/ai-agents/)
- [Enterprise RAG](https://bowdylabs.com/insights/topics/enterprise-rag/)
- [Arabic AI](https://bowdylabs.com/insights/topics/arabic-ai/)
- [AI Governance](https://bowdylabs.com/insights/topics/ai-governance/)
- [Automation in Saudi Arabia](https://bowdylabs.com/insights/topics/automation-saudi-arabia/)
- [English AI Agents](https://bowdylabs.com/en/insights/topics/ai-agents/)
- [English Enterprise RAG](https://bowdylabs.com/en/insights/topics/enterprise-rag/)
- [English Arabic AI](https://bowdylabs.com/en/insights/topics/arabic-ai/)
- [English AI Governance](https://bowdylabs.com/en/insights/topics/ai-governance/)
- [English Automation in Saudi Arabia](https://bowdylabs.com/en/insights/topics/automation-saudi-arabia/)

## Priority guides

- [Enterprise AI Agent Architecture](https://bowdylabs.com/en/insights/enterprise-ai-agent-architecture/)
- [AI Agent Use Cases for Saudi Businesses](https://bowdylabs.com/en/insights/ai-agent-use-cases-saudi-arabia/)
- [Saudi Arabic AI Assistant Design](https://bowdylabs.com/en/insights/saudi-arabic-ai-assistant-design/)
- [Arabic AI Customer Service in Saudi Arabia](https://bowdylabs.com/en/insights/arabic-ai-customer-service-saudi/)
- [WhatsApp + CRM AI Automation](https://bowdylabs.com/en/insights/whatsapp-crm-ai-automation-saudi/)
- [AI Automation ROI Measurement](https://bowdylabs.com/en/insights/ai-automation-roi-measurement-saudi/)

## Discovery feeds

- [XML sitemap](https://bowdylabs.com/sitemap.xml)
- [Arabic RSS](https://bowdylabs.com/feed.xml)
- [English RSS](https://bowdylabs.com/en/feed.xml)

## Notes for agents

- Prefer canonical public URLs listed in the sitemap.
- Arabic and English alternates are connected with hreflang.
- Public case studies live under /work/; internal/private routes are intentionally excluded from this file.
- BOWDY LABS provides independent consulting for Google products and does not claim to represent Google.
`;

if (!llms.startsWith("# ")) throw new Error("llms.txt must begin with an H1");
if (!/\[[^\]]+\]\(https:\/\/bowdylabs\.com\//.test(llms)) throw new Error("llms.txt must contain Markdown links");
if (llms.includes("/alarjancrm/")) throw new Error("Private CRM route must not appear in llms.txt");
await writeFile(join(dist, "llms.txt"), llms);

const home = await readFile(join(dist, "index.html"), "utf8");
if (home.includes('<link rel="stylesheet" href="/assets/css/positioning.css">')) {
  throw new Error("positioning.css is still render-blocking on homepage");
}
if (!home.includes('media="print" onload="this.media=\'all\'"')) {
  throw new Error("Deferred positioning.css pattern missing");
}
for (const slug of neededAgents) {
  if (!home.includes(`/assets/media/agents/${slug}-96.webp`) && home.includes(`${slug}-520.webp`)) {
    throw new Error(`Compact ${slug} image was not replaced with responsive thumbnail`);
  }
}

console.log(`PageSpeed hardening: ${htmlUpdated} HTML pages updated; ${generatedThumbs} agent thumbnails generated; llms.txt normalized.`);
