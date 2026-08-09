import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const root = join(projectRoot, "dist");
const errors = [];
const warnings = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const htmlSet = new Set(htmlFiles.map((file) => relative(root, file)));
const titles = new Map();
const canonicals = new Map();
let indexableCount = 0;

for (const file of htmlFiles) {
  const name = relative(root, file);
  const html = await readFile(file, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] ?? "";
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = visibleText.split(/\s+/).filter(Boolean).length;
  const schemaTypes = [];

  if (!/<html lang="(ar|en)" dir="(rtl|ltr)">/i.test(html)) errors.push(`${name}: invalid lang/dir`);
  if (!title) errors.push(`${name}: missing title`);
  if (!description) errors.push(`${name}: missing meta description`);
  if (!html.includes('<meta name="google-site-verification" content="RhoDv6mIF2DsPd84eCLRiv9HGlPI-viiXPcJIJGafDM">')) {
    errors.push(`${name}: Google Search Console verification tag missing`);
  }
  if (!canonical) errors.push(`${name}: missing canonical`);
  if (h1Count !== 1) errors.push(`${name}: expected one H1, found ${h1Count}`);
  if (!/<meta property="og:image"/i.test(html) || !/<meta name="twitter:card" content="summary_large_image"/i.test(html)) {
    errors.push(`${name}: incomplete social metadata`);
  }
  if (!/<link rel="alternate" hreflang="ar"/i.test(html) || !/<link rel="alternate" hreflang="x-default"/i.test(html)) {
    errors.push(`${name}: incomplete hreflang cluster`);
  }
  if (html.includes('href="#"')) errors.push(`${name}: placeholder href`);
  if (/<img(?![^>]+\salt=)[^>]*>/i.test(html)) errors.push(`${name}: image missing alt attribute`);
  if (/<a[^>]+target="_blank"(?![^>]+rel="[^"]*noopener)/i.test(html)) {
    errors.push(`${name}: target=_blank link missing noopener`);
  }
  if (title && titles.has(title)) errors.push(`${name}: duplicate title with ${titles.get(title)}`);
  else if (title) titles.set(title, name);
  if (canonical && canonicals.has(canonical)) errors.push(`${name}: duplicate canonical with ${canonicals.get(canonical)}`);
  else if (canonical) canonicals.set(canonical, name);
  if (title && title.length > 86) warnings.push(`${name}: long title (${title.length})`);
  if (description && (description.length < 80 || description.length > 200)) {
    warnings.push(`${name}: description length ${description.length}`);
  }
  if (!robots.includes("noindex")) {
    indexableCount += 1;
    if (title && !title.includes("BOWDY LABS")) errors.push(`${name}: indexable title missing BOWDY LABS`);
  }
  if (name === "404.html" && !robots.includes("noindex")) errors.push("404.html: must be noindex");
  if (!html.includes("/assets/brand/bowdy-labs-mark.svg")) errors.push(`${name}: BOWDY mark missing`);
  if (!html.includes("/assets/og/bowdy-labs-og.png")) errors.push(`${name}: OG image missing`);
  if (/شركاؤنا|our partners/i.test(html)) errors.push(`${name}: unverified partnership wording`);
  if (html.includes('href="/brand/"')) errors.push(`${name}: removed brand page is still linked`);
  if (!html.includes("floating-action-label")) errors.push(`${name}: floating contact labels missing`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      const nodes = parsed["@graph"] ?? [parsed];
      nodes.forEach((node) => {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        schemaTypes.push(...types.filter(Boolean));
      });
    } catch (error) {
      errors.push(`${name}: invalid JSON-LD (${error.message})`);
    }
  }
  for (const type of ["WebPage", "Organization", "WebSite", "ProfessionalService"]) {
    if (!schemaTypes.includes(type)) errors.push(`${name}: schema missing ${type}`);
  }
  if (name === "index.html" && !schemaTypes.includes("FAQPage")) errors.push("index.html: schema missing FAQPage");
  if (name === "services/index.html") {
    const serviceSchemaCount = schemaTypes.filter((type) => type === "Service").length;
    if (!schemaTypes.includes("LocalBusiness")) errors.push("services/index.html: schema missing LocalBusiness");
    if (!schemaTypes.includes("OfferCatalog")) errors.push("services/index.html: schema missing OfferCatalog");
    if (!schemaTypes.includes("BreadcrumbList")) errors.push("services/index.html: schema missing BreadcrumbList");
    if (serviceSchemaCount !== 9) {
      errors.push(`services/index.html: expected 9 Service schema nodes, found ${serviceSchemaCount}`);
    }
    if (!visibleText.includes("شركة ذكاء اصطناعي سعودية")) {
      errors.push("services/index.html: primary Saudi AI keyword missing");
    }
    if (!visibleText.includes("وكلاء ذكاء اصطناعي يتكلمون بالعربية")) {
      errors.push("services/index.html: Arabic AI agents keyword missing");
    }
    if (!html.includes('class="services-hero-stage"') || !html.includes('class="services-ai-core"')) {
      errors.push("services/index.html: lightweight identity-based services hero missing");
    }
    if (html.includes('rel="preload" as="image"') || html.includes('class="services-hero-image"')) {
      errors.push("services/index.html: obsolete raster hero path still present");
    }
    if (!html.includes('"mainEntity":{"@id":"https://bowdy-labs.vercel.app/services/#catalog"}')) {
      errors.push("services/index.html: WebPage mainEntity is not linked to the service catalog");
    }
  }
  if (name.startsWith("services/") && name !== "services/index.html" && !schemaTypes.includes("Service")) {
    errors.push(`${name}: schema missing Service`);
  }
  if (name.startsWith("services/") && name !== "services/index.html" && !schemaTypes.includes("BreadcrumbList")) {
    errors.push(`${name}: schema missing BreadcrumbList`);
  }
  if (name.startsWith("services/") && name !== "services/index.html" && wordCount < 650) {
    errors.push(`${name}: service content is too thin (${wordCount} words)`);
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/gi)) {
    const url = match[1].split(/[?#]/)[0];
    if (!url || url === "/" || url.startsWith("/.well-known/")) continue;
    const local = url.endsWith("/") ? `${url.slice(1)}index.html` : url.slice(1);
    if (url.endsWith("/") && !htmlSet.has(local)) errors.push(`${name}: broken internal page ${url}`);
    if (/\.(css|js|png|svg|webp|webmanifest|ico)$/i.test(url)) {
      try {
        await access(join(root, local));
      } catch {
        errors.push(`${name}: missing asset ${url}`);
      }
    }
  }
}

for (const asset of [
  "index.html",
  "en/index.html",
  "services/index.html",
  "contact/index.html",
  "assets/css/main.css",
  "assets/js/main.js",
  "assets/brand/bowdy-labs-mark.svg",
  "assets/media/bowdy-intelligence.webp",
  "assets/media/bowdy-intelligence-760.webp",
  "assets/media/bowdy-intelligence-1200.webp",
  "assets/og/bowdy-labs-og.png",
  "assets/icons/favicon.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "manifest.webmanifest",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
]) {
  try {
    await access(join(root, asset));
  } catch {
    errors.push(`missing required asset ${asset}`);
  }
}

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const sitemapCount = (sitemap.match(/<url>/g) || []).length;
if (sitemapCount !== indexableCount) {
  errors.push(`sitemap has ${sitemapCount} URLs for ${indexableCount} indexable pages`);
}

const css = await readFile(join(root, "assets/css/main.css"), "utf8");
const js = await readFile(join(root, "assets/js/main.js"), "utf8");
const servicesHtml = await readFile(join(root, "services/index.html"), "utf8");
for (const breakpoint of [
  "@media (max-width:900px)",
  "@media (max-width:640px)",
  "@media (max-width:390px)",
  "@media (max-width:340px)",
  "safe-area-inset-bottom",
  "prefers-reduced-motion",
]) {
  if (!css.includes(breakpoint)) errors.push(`CSS missing ${breakpoint}`);
}
if (!css.includes("font-display:swap")) errors.push("CSS missing font-display: swap");
if (!css.includes("content-visibility:auto")) errors.push("CSS missing below-fold content visibility optimization");
if (!servicesHtml.includes('<script src="/assets/js/main.js" defer>')) {
  errors.push("services/index.html: JavaScript is not deferred");
}
if (/<script[^>]+src="https?:\/\//i.test(servicesHtml) || /<link[^>]+rel="stylesheet"[^>]+href="https?:\/\//i.test(servicesHtml) || /<link[^>]+href="https?:\/\/[^>]+rel="stylesheet"/i.test(servicesHtml)) {
  errors.push("services/index.html: render path includes a third-party script or stylesheet");
}
if (Buffer.byteLength(css) > 90_000) errors.push(`CSS performance budget exceeded (${Buffer.byteLength(css)} bytes)`);
if (Buffer.byteLength(js) > 8_000) errors.push(`JavaScript performance budget exceeded (${Buffer.byteLength(js)} bytes)`);
if (Buffer.byteLength(servicesHtml) > 70_000) {
  errors.push(`services page HTML performance budget exceeded (${Buffer.byteLength(servicesHtml)} bytes)`);
}

const brandMark = await readFile(join(root, "assets/brand/bowdy-labs-mark.svg"), "utf8");
for (const sourceMarkToken of ['cx="21" cy="26" r="17"', 'cx="38" cy="11" r="8.5"', '#6C5CE7', '#5B72F2', '#00D4FF']) {
  if (!brandMark.includes(sourceMarkToken)) errors.push(`brand mark is missing source identity token ${sourceMarkToken}`);
}

const og = await readFile(join(root, "assets/og/bowdy-labs-og.png"));
if (og.toString("hex", 0, 8) !== "89504e470d0a1a0a") {
  errors.push("OG image is not PNG");
} else if (og.readUInt32BE(16) !== 1200 || og.readUInt32BE(20) !== 630) {
  errors.push(`OG image dimensions are ${og.readUInt32BE(16)}x${og.readUInt32BE(20)}`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML pages, structured data, internal links, responsive CSS, and brand assets.`);
}

if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  warnings.forEach((warning) => console.log(`- ${warning}`));
}
