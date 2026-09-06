import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");

const pages = [
  {
    file: "about/index.html",
    title: "عن باودي لابز | شركة ذكاء اصطناعي سعودية في الرياض",
    description:
      "تعرّف على باودي لابز في الرياض: شركة تقنية وذكاء اصطناعي سعودية تبني وكلاء AI وحلول برمجية وأمنية وأنظمة نمو رقمية للشركات.",
  },
  {
    file: "contact/index.html",
    title: "تواصل مع باودي لابز | استشارات AI وتقنية في الرياض",
    description:
      "تواصل مع باودي لابز في الرياض لبدء مشروع ذكاء اصطناعي أو برمجي أو أمني أو مناقشة احتياج تقني ونمو رقمي للشركات.",
  },
  {
    file: "services/google-support/index.html",
    title: "استشارات Google في السعودية وحل مشكلات الحسابات | BOWDY LABS",
    description:
      "استشارات مستقلة لمنتجات Google في السعودية لتشخيص المشكلات وتنظيم الأدلة واختيار مسار الدعم أو الاعتراض المناسب دون ادعاء تمثيل Google أو ضمان قراراتها.",
  },
];

function replaceTag(html, pattern, replacement, label, file) {
  if (!pattern.test(html)) {
    throw new Error(`Could not find ${label} in ${file}`);
  }
  return html.replace(pattern, replacement);
}

for (const page of pages) {
  const path = join(dist, page.file);
  let html = await readFile(path, "utf8");

  html = replaceTag(html, /<title>[^<]*<\/title>/i, `<title>${page.title}</title>`, "title", page.file);
  html = replaceTag(
    html,
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?\s*>/i,
    `<meta name="description" content="${page.description}">`,
    "meta description",
    page.file,
  );

  // Keep social snippets aligned with the search snippet intent where the tags already exist.
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?\s*>/i, `<meta property="og:title" content="${page.title}">`);
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?\s*>/i, `<meta property="og:description" content="${page.description}">`);
  html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?\s*>/i, `<meta name="twitter:title" content="${page.title}">`);
  html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?\s*>/i, `<meta name="twitter:description" content="${page.description}">`);

  await writeFile(path, html);
}

console.log(`GSC CTR polish updated ${pages.length} Arabic pages.`);
