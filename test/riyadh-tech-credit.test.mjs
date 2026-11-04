import test from "node:test";
import assert from "node:assert/strict";
import { riyadhContractorsArticle as article } from "../src/riyadh-tech-contractors.mjs";
import { magazineArticles, articlePath, magazine } from "../src/riyadh-tech-content.mjs";
import { magazineArticleModel, editor, periodical } from "../src/riyadh-tech-page.mjs";
import { site } from "../src/content.mjs";

const name = "خالد الهادي";
const personId = `${site.url}${articlePath(article)}#editorial-credit`;
const fixture = (role, extra = {}) => ({
  ...article, modifiedAt: "2026-11-04T04:00:00+03:00",
  editorialCredit: { name, role, confirmed: true, ...extra },
});
const articleNode = page => page.schema.find(node => node?.["@type"] === "BlogPosting");

test("unconfirmed editorial credit produces no public name, Person or metadata change", () => {
  const page = magazineArticleModel({ ...article, editorialCredit: { ...article.editorialCredit, confirmed: false } });
  assert.deepEqual(page, magazineArticleModel({ ...article, editorialCredit: undefined }));
  assert.equal(JSON.stringify(page).includes(name), false);
  assert.equal(Object.hasOwn(page, "metaAuthor"), false);
});

test("confirmed writer is the article author and the name agrees with its visible byline", () => {
  const page = magazineArticleModel(fixture("author"));
  const node = articleNode(page);
  assert.deepEqual(node.author, { "@id": personId });
  assert.equal(page.metaAuthor, name);
  assert.ok(page.body.includes(`href="#editorial-credit">${name}</a>`));
  assert.ok(page.body.includes(`id="editorial-credit">كتابة: ${name}</span>`));
  assert.deepEqual(page.schema.find(n => n?.["@id"] === personId), { "@type": "Person", "@id": personId, name });
  assert.equal(Object.hasOwn(node, "contributor"), false);
  assert.equal(node.datePublished, article.publishedAt);
  assert.equal(node.dateModified, "2026-11-04T04:00:00+03:00");
  assert.ok(page.body.includes('آخر تحديث: <time datetime="2026-11-04T04:00:00+03:00">'));
});

test("confirmed contribution or described review stays separate from authorship", () => {
  const details = "مراجعة المعلومات المقدمة في المقال";
  const page = magazineArticleModel(fixture("contributor", { details }));
  const node = articleNode(page);
  assert.deepEqual(node.author, { "@id": editor["@id"] });
  assert.deepEqual(node.contributor, { "@id": personId });
  assert.equal(page.metaAuthor, magazine.editor);
  assert.equal(node.creditText, `مساهمة في المقال: ${name} — ${details}`);
  assert.ok(page.body.includes(node.creditText));
  assert.ok(page.body.includes(`href="${magazine.path}#editorial">${magazine.editor}</a>`));
});

test("publication is a visible text credit without invented creative authorship", () => {
  const page = magazineArticleModel(fixture("publication"));
  const node = articleNode(page);
  assert.deepEqual(node.author, { "@id": editor["@id"] });
  assert.equal(node.creditText, `نشر المقال: ${name}`);
  assert.ok(page.body.includes(node.creditText));
  assert.equal(Object.hasOwn(node, "contributor"), false);
  assert.equal(page.schema.some(n => n?.["@type"] === "Person"), false);
  assert.equal(page.metaAuthor, magazine.editor);
});

test("every credit role preserves the publication, publisher, promotional disclosure and company order", () => {
  const current = magazineArticleModel(article);
  const currentNode = articleNode(current);
  for (const role of ["author", "contributor", "publication"]) {
    const page = magazineArticleModel(fixture(role));
    const node = articleNode(page);
    assert.deepEqual(node.publisher, currentNode.publisher);
    assert.deepEqual(node.isPartOf, currentNode.isPartOf);
    assert.deepEqual(page.schema.find(n => n?.["@type"] === "Periodical"), periodical);
    assert.deepEqual(page.schema.find(n => n?.["@id"] === editor["@id"]), editor);
    assert.deepEqual(page.schema.find(n => n?.["@type"] === "ItemList"), current.schema.find(n => n?.["@type"] === "ItemList"));
    assert.equal(node.genre, currentNode.genre);
    assert.equal(node.articleBody, currentNode.articleBody);
    assert.ok(page.body.includes(article.disclosure));
    assert.ok(page.body.includes('href="https://tawodco.com/" target="_blank" rel="sponsored noopener noreferrer"'));
    assert.ok(page.body.includes("الناشر المؤسسي:"));
    assert.equal(JSON.stringify(page.schema).includes("aggregateRating"), false);
    assert.equal(JSON.stringify(page.schema).includes("eslam-elshikh.com/#person"), false);
  }
});

test("credit rendering never mutates shared attribution for other editorial or automatic articles", () => {
  const others = magazineArticles.filter(entry => entry.slug !== article.slug);
  const before = others.map(entry => magazineArticleModel(entry));
  for (const role of ["author", "contributor", "publication"]) magazineArticleModel(fixture(role));
  assert.deepEqual(others.map(entry => magazineArticleModel(entry)), before);
  assert.equal(JSON.stringify(before).includes(name), false);
});

test("invalid confirmed credits fail rather than silently claiming an unsupported role", () => {
  for (const role of [null, "publisher", "__proto__", "reviewer"]) {
    assert.throws(() => magazineArticleModel(fixture(role)), /Invalid confirmed editorial credit/);
  }
  assert.throws(() => magazineArticleModel(fixture("author", { name: " " })), /Invalid confirmed editorial credit/);
  assert.throws(() => magazineArticleModel(fixture("author", { details: " " })), /Invalid editorial credit details/);
  const automated = magazineArticles.find(entry => entry.automated);
  assert.throws(() => magazineArticleModel({ ...automated, editorialCredit: fixture("author").editorialCredit }), /Invalid confirmed editorial credit/);
});

test("editorial names and credit details are escaped in the visible page", () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const page = magazineArticleModel(fixture("author", { name: unsafe, details: unsafe }));
  assert.equal(page.body.includes(unsafe), false);
  assert.ok(page.body.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.equal(page.metaAuthor, unsafe); // layout escapes the attribute independently.
});


test("the owner-confirmed publication credit uses the supplied bio without changing the author or publisher", () => {
  assert.equal(article.editorialCredit.role, "publication");
  assert.equal(article.editorialCredit.confirmed, true);
  const page = magazineArticleModel(article);
  const node = articleNode(page);
  assert.equal(node.creditText, "نشر المقال: خالد الهادي — ناشر ومهتم بالمحتوى العقاري والمقاولات العامة في الرياض");
  assert.ok(page.body.includes(node.creditText));
  assert.deepEqual(node.author, { "@id": editor["@id"] });
  assert.deepEqual(node.publisher, { "@id": `${site.url}/#organization` });
  assert.equal(page.schema.some(n => n?.["@type"] === "Person"), false);
  assert.equal(Object.hasOwn(node, "contributor"), false);
});
