import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "..", "dist");

const STYLE_ID = "bowdy-performance-polish";
const style = `<style id="${STYLE_ID}">
/* Keep above-the-fold content visible on first paint; below-the-fold reveal behavior stays unchanged. */
.hero .reveal,
.services-hero .reveal,
.agents-hero .reveal,
.page-hero .reveal {
  opacity: 1;
  transform: none;
  transition: none;
}

/* Reduce continuous GPU/compositing work on touch and smaller screens without changing layout. */
@media (max-width: 900px), (hover: none), (pointer: coarse) {
  .ambient {
    filter: blur(72px);
    opacity: .10;
  }

  .site-header.is-scrolled {
    background: rgba(5, 8, 21, .97);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .mobile-menu.is-open {
    background: rgba(5, 8, 21, .985);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .mobile-bottom-nav {
    background: rgba(5, 8, 21, .98);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .button-ghost,
  .hero-data-card,
  .services-hero-module,
  .services-hero-signal,
  .agents-hero-avatar span,
  .agent-index,
  .agent-portrait-label {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .hero-orbit,
  .services-orbit,
  .services-ai-core::before,
  .agents-hero-orbit,
  .agents-hero-avatar,
  .floating-call,
  .floating-whatsapp,
  .value-check {
    animation: none !important;
  }

  .scan-line {
    top: 52%;
    animation: none !important;
  }

  .services-flow::after {
    display: none;
  }
}
</style>`;

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

const files = await htmlFiles(dist);
let updated = 0;

for (const file of files) {
  let html = await readFile(file, "utf8");
  if (html.includes(`id="${STYLE_ID}"`)) continue;
  if (!html.includes("</head>")) throw new Error(`Missing </head> in ${file}`);
  html = html.replace("</head>", `${style}\n</head>`);
  await writeFile(file, html);
  updated += 1;
}

if (!updated) throw new Error("Performance polish did not update any HTML files");

const homepage = await readFile(join(dist, "index.html"), "utf8");
if (!homepage.includes(`id="${STYLE_ID}"`)) throw new Error("Performance style missing from homepage");
if (!homepage.includes(".hero .reveal")) throw new Error("Above-the-fold reveal override missing");
if (!homepage.includes("@media (max-width: 900px), (hover: none), (pointer: coarse)")) {
  throw new Error("Mobile performance media query missing");
}

console.log(`BOWDY performance polish updated ${updated} HTML pages.`);
