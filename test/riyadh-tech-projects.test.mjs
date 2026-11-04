import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { riyadhContractorsArticle as article } from "../src/riyadh-tech-contractors.mjs";
import { magazineArticles, articlePath, readingMinutes, sectionText, projectExampleText } from "../src/riyadh-tech-content.mjs";
import { magazineArticleModel, magazineStyles, editor } from "../src/riyadh-tech-page.mjs";

const articleNode = page => page.schema.find(node => node?.["@type"] === "BlogPosting");
const url = `https://bowdylabs.com${articlePath(article)}`;

test("two sourced Tawod examples have visible facts, photographs, source links and editorial questions", () => {
  const page = magazineArticleModel(article);
  assert.equal(article.projectExamples.length, 2);
  assert.equal((page.body.match(/class="rt-project-example"/g) ?? []).length, 2);
  assert.equal((page.body.match(/class="rt-project-reading"/g) ?? []).length, 2);
  assert.ok(page.body.includes("900 م²"));
  assert.ok(page.body.includes("29,122.40 م²"));
  assert.ok(page.body.includes("8 مستودعات"));
  assert.ok(page.body.includes("6 أشهر"));
  for (const project of article.projectExamples) {
    assert.ok(page.body.includes(`id="${project.id}"`));
    assert.ok(page.body.includes(`alt="${project.image.alt}"`));
    assert.ok(page.body.includes(`href="${project.source.url}" target="_blank" rel="sponsored noopener noreferrer"`));
    assert.ok(article.sources.some(source => source.url === project.source.url && source.sponsored));
    for (const fact of project.facts) assert.ok(page.body.includes(fact.label) && page.body.includes(fact.value));
  }
  assert.ok(page.body.includes("الأرقام والمدد أدناه كما تنشرها تعاود"));
});

test("CreativeWork parts and ImageObject references resolve to the exact visible examples", () => {
  const page = magazineArticleModel(article);
  const node = articleNode(page);
  assert.equal(node.hasPart.length, 2);
  assert.equal(node.image.length, 3);
  for (const project of article.projectExamples) {
    const part = page.schema.find(n => n?.["@id"] === `${url}#${project.id}`);
    const photo = page.schema.find(n => n?.["@id"] === part.image["@id"]);
    assert.equal(part["@type"], "CreativeWork");
    assert.equal(part.text, projectExampleText(project));
    assert.deepEqual(part.isPartOf, { "@id": `${url}#article` });
    assert.equal(part.citation.url, project.source.url);
    assert.equal(photo["@type"], "ImageObject");
    assert.equal(photo.contentUrl, `https://bowdylabs.com${project.image.src}`);
    assert.equal(photo.caption, project.image.caption);
    assert.ok(page.body.includes(photo.caption));
    assert.ok(node.image.some(image => image["@id"] === photo["@id"]));
    assert.ok(node.articleBody.includes(projectExampleText(project)));
  }
  assert.equal(node.wordCount, node.articleBody.trim().split(/\s+/u).length);
});

test("hidden example data is not marked up when its section is absent", () => {
  const fixture = { ...article, sections: [{ title: "مقال مختصر", paragraphs: ["نص ظاهر."] }] };
  const page = magazineArticleModel(fixture), node = articleNode(page);
  assert.equal(Object.hasOwn(node, "hasPart"), false);
  assert.equal(Array.isArray(node.image), false);
  assert.equal(page.schema.some(n => n?.["@type"] === "ImageObject"), false);
  assert.equal(page.styles.some(path => path.includes("riyadh-tech-projects.css")), false);
  assert.equal(page.body.includes("rt-project-example"), false);
});

test("new visual fields escape names, captions, descriptions and workflow text", () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const source = { name: unsafe, url: 'https://example.com/?a=1&b="quoted"', sponsored: true };
  const project = { ...article.projectExamples[0], name: unsafe, description: unsafe, takeaway: unsafe, scope: [unsafe], facts: [{ label: unsafe, value: unsafe }], source, image: { ...article.projectExamples[0].image, alt: unsafe, caption: unsafe } };
  const page = magazineArticleModel({ ...article, projectExamples: [project], sections: [{ title: "مثال", projects: true, steps: [{ title: unsafe, description: unsafe }] }] });
  assert.equal(page.body.includes(unsafe), false);
  assert.ok(page.body.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.ok(page.body.includes('href="https://example.com/?a=1&amp;b=&quot;quoted&quot;"'));
});

test("project photography has real dimensions, responsive alternatives and a bounded payload", async () => {
  let total = 0;
  const page = magazineArticleModel(article);
  for (const project of article.projectExamples) {
    const path = fileURLToPath(new URL(`..${project.image.src}`, import.meta.url));
    const smallPath = fileURLToPath(new URL(`..${project.image.small}`, import.meta.url));
    const [full, small] = await Promise.all([sharp(path).metadata(), sharp(smallPath).metadata()]);
    assert.equal(full.format, "webp");
    assert.equal(full.width, project.image.width);
    assert.equal(full.height, project.image.height);
    assert.equal(small.width, 480);
    assert.ok(page.body.includes(`width="${full.width}" height="${full.height}" loading="lazy" decoding="async"`));
    total += (await stat(path)).size + (await stat(smallPath)).size;
  }
  assert.ok(total < 300_000, `four responsive photographs total ${total} bytes`);
  const css = await readFile(new URL("../assets/css/riyadh-tech-projects.css", import.meta.url), "utf8");
  assert.ok(css.includes("--rt-reader-scale"));
  assert.ok(css.includes("@media(max-width:640px)"));
});

test("the magazine author, publication credit, institutional publisher and other articles stay separate", () => {
  const page = magazineArticleModel(article), node = articleNode(page);
  assert.deepEqual(node.author, { "@id": editor["@id"] });
  assert.deepEqual(node.publisher, { "@id": "https://bowdylabs.com/#organization" });
  assert.equal(node.creditText, "نشر المقال: خالد الهادي — ناشر ومهتم بالمحتوى العقاري والمقاولات العامة في الرياض");
  assert.equal(JSON.stringify(page.schema).includes("aggregateRating"), false);
  assert.equal(node.genre, "محتوى ترويجي");
  const ordinary = magazineArticles.find(entry => entry.slug !== article.slug && !entry.automated);
  const other = magazineArticleModel(ordinary);
  assert.deepEqual(other.styles, magazineStyles);
  assert.equal(other.body.includes("rt-project-example"), false);
  assert.equal(other.schema.some(n => n?.["@type"] === "CreativeWork"), false);
});

test("reading-time content includes project facts and all four visible workflow stages", () => {
  const projects = article.sections.find(section => section.projects);
  const workflow = article.sections.find(section => section.steps);
  assert.equal(workflow.steps.length, 4);
  assert.ok(sectionText(article, projects).includes("29,122.40 م²"));
  for (const step of workflow.steps) assert.ok(sectionText(article, workflow).includes(step.description));
  assert.ok(readingMinutes(article) > 10);
  const page = magazineArticleModel(article);
  assert.ok(page.body.includes(`تمت مراجعة الروابط والمعلومات في`));
  assert.ok(article.sourcesReviewedAt.startsWith("2026-11-04"));
});
