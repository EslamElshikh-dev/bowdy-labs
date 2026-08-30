import { readFile, rename } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content.mjs";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const privatePage = join(projectRoot, "dist", "alarjancrm", "index.html");
const hiddenPrivatePage = `${privatePage}.private`;
const sitemapPath = join(projectRoot, "dist", "sitemap.xml");

const privateHtml = await readFile(privatePage, "utf8");
const sitemap = await readFile(sitemapPath, "utf8");
const privateErrors = [];

const robots = privateHtml.match(/<meta name="robots" content="([^"]+)"/i)?.[1] ?? "";
if (!robots.includes("noindex") || !robots.includes("nofollow")) {
  privateErrors.push("private proposal must be noindex and nofollow");
}
if (!privateHtml.includes('class="proposal-frame"')) {
  privateErrors.push("private proposal frame is missing");
}
if (sitemap.includes(`<loc>${site.url}/alarjancrm/</loc>`)) {
  privateErrors.push("private proposal is present in sitemap");
}

if (privateErrors.length) {
  privateErrors.forEach((error) => console.error(`ERROR ${error}`));
  process.exit(1);
}

await rename(privatePage, hiddenPrivatePage);
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
  await rename(hiddenPrivatePage, privatePage);
}

if (publicValidationExitCode !== 0) process.exit(publicValidationExitCode);
console.log("Private proposal validation passed");
