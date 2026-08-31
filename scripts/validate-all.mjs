import { readFile, rename } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content.mjs";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const privatePages = [
  join(projectRoot, "dist", "alarjancrm", "index.html"),
  join(projectRoot, "dist", "alarjancrm", "dashboard", "index.html"),
  join(projectRoot, "dist", "alarjancrm", "sap-integration", "index.html"),
];
const sitemapPath = join(projectRoot, "dist", "sitemap.xml");

const privateDocuments = await Promise.all(privatePages.map((page) => readFile(page, "utf8")));
const sitemap = await readFile(sitemapPath, "utf8");
const privateErrors = [];

privateDocuments.forEach((html, index) => {
  const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] ?? "";
  if (!robots.includes("noindex") || !robots.includes("nofollow")) {
    privateErrors.push(`private proposal ${index + 1} must be noindex and nofollow`);
  }
  if (!html.includes('class="proposal-frame"')) {
    privateErrors.push(`private proposal ${index + 1} frame is missing`);
  }
});
if (
  sitemap.includes(`<loc>${site.url}/alarjancrm/</loc>`) ||
  sitemap.includes(`<loc>${site.url}/alarjancrm/dashboard/</loc>`) ||
  sitemap.includes(`<loc>${site.url}/alarjancrm/sap-integration/</loc>`)
) {
  privateErrors.push("private proposal is present in sitemap");
}

if (privateErrors.length) {
  privateErrors.forEach((error) => console.error(`ERROR ${error}`));
  process.exit(1);
}

const hiddenPrivatePages = privatePages.map((page) => `${page}.private`);
await Promise.all(privatePages.map((page, index) => rename(page, hiddenPrivatePages[index])));
let publicValidationExitCode = 1;

try {
  publicValidationExitCode = await new Promise((resolve, reject) => {
    const validation = spawn(process.execPath, ["scripts/validate.mjs"], {
      cwd: projectRoot,
      stdio: "inherit",
    });
    validation.once("error", reject);
    validation.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  await Promise.all(hiddenPrivatePages.map((page, index) => rename(page, privatePages[index])));
}

if (publicValidationExitCode !== 0) process.exit(publicValidationExitCode);
console.log("Private proposal validation passed");
