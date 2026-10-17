import sharp from "sharp";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { magazine, magazineArticles } from "./riyadh-tech-content.mjs";

const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const colors = { argon: "#81b6ff", interface: "#59e6c4", haiku: "#efa88c", agents: "#b6a0fc", knowledge: "#78d5e6", evaluation: "#9bb5fd", business: "#edcf92" };

const fonts = fileURLToPath(new URL("../assets/fonts/", import.meta.url));

async function lettering(text, family, file, size, color) {
  return sharp({ text: { text: `<span foreground="${color}">${esc(text)}</span>`, font: `${family} ${size}`, fontfile: join(fonts, file), rgba: true } }).png().toBuffer({ resolveWithObject: true });
}

export async function generateMagazineShareImages(dist) {
  const entries = [{ slug: "", visual: "RIYADH TECH", art: "interface", label: "AI NEWS · IDEAS · EXPLAINERS" }, ...magazineArticles];
  for (const article of entries) {
    const color = colors[article.art];
    const graphic = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><radialGradient id="glow"><stop stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="#050815" stop-opacity="0"/></radialGradient><pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0v44" fill="none" stroke="#97bbd0" stroke-opacity=".06"/></pattern></defs><rect width="1200" height="630" fill="#050815"/><rect width="1200" height="630" fill="url(#grid)"/><ellipse cx="600" cy="300" rx="520" ry="330" fill="url(#glow)"/><g stroke="${color}" fill="none" opacity=".3"><ellipse cx="600" cy="310" rx="285" ry="160" transform="rotate(-20 600 310)"/><ellipse cx="600" cy="310" rx="285" ry="160" transform="rotate(20 600 310)"/><circle cx="600" cy="310" r="220"/></g><path d="M56 56h1088M56 565h1088" stroke="#57728a" stroke-opacity=".5"/></svg>`;
    // Use repository-local fonts so Arabic remains readable on the deployment builder.
    const title = await lettering(magazine.name, "IBM Plex Sans Arabic Bold", "ibm-plex-arabic-700.woff2", 57, "#e8f1fc");
    const visual = await lettering(article.visual, "Sora Bold", "sora-700.woff2", article.visual.length > 10 ? 67 : 88, color);
    const label = await lettering(article.label, "Sora", "sora-400.woff2", 15, "#a8bad1");
    const top = await lettering("BOWDY LABS / RIYADH TECH", "Sora", "sora-500.woff2", 17, color);
    const bottom = await lettering("BOWDYLABS.COM/RIYADH-TECH", "Sora", "sora-400.woff2", 14, "#a8bad1");
    await sharp(Buffer.from(graphic)).composite([
      { input: title.data, left: Math.round((1200 - title.info.width) / 2), top: 200 },
      { input: visual.data, left: Math.round((1200 - visual.info.width) / 2), top: 298 },
      { input: label.data, left: Math.round((1200 - label.info.width) / 2), top: 424 },
      { input: top.data, left: 70, top: 80 },
      { input: bottom.data, left: 70, top: 583 },
    ]).png({ compressionLevel: 9 }).toFile(join(dist, "assets", "og", `riyadh-tech${article.slug ? `-${article.slug}` : ""}.png`));
  }
}
