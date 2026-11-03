import test from "node:test";
import assert from "node:assert/strict";
import { riyadhContractorsArticle as article } from "../src/riyadh-tech-contractors.mjs";
import { articleDate, articlePath, editorialArticles } from "../src/riyadh-tech-content.mjs";
import { magazineArticleModel, magazineCard, magazineFeed } from "../src/riyadh-tech-page.mjs";

test("promotional ranking is disclosed and its visible table agrees with structured data", () => {
  const page = magazineArticleModel(article);
  const schema = page.schema.find(node => node?.["@type"] === "BlogPosting");
  const list = page.schema.find(node => node?.["@type"] === "ItemList");
  const table = page.body.match(/<table class="rt-comparison">([\s\S]*?)<\/table>/)?.[1];
  assert.ok(page.body.indexOf(article.disclosure) < page.body.indexOf('<table class="rt-comparison">'));
  assert.equal(list.numberOfItems, 10);
  assert.equal(new Set(list.itemListElement.map(entry => entry.item.url)).size, 10);
  assert.equal((table.match(/<th scope="row">/g) ?? []).length, 10);
  assert.ok(page.body.includes('role="region" aria-label="الشركات العشر في ترتيب هذا الدليل الترويجي" tabindex="0"'));
  let previous = -1;
  for (const entry of list.itemListElement) {
    const position = table.indexOf(`href="${entry.item.url}"`);
    assert.ok(position > previous);
    assert.equal(entry.position, list.itemListElement.indexOf(entry) + 1);
    assert.ok(table.includes(entry.item.name));
    previous = position;
  }
  assert.equal(list.itemListElement[0].item.url, "https://tawodco.com/");
  assert.ok(page.body.includes('href="https://tawodco.com/" target="_blank" rel="sponsored noopener noreferrer"'));
  assert.equal(schema.genre, "محتوى ترويجي");
  assert.ok(schema.articleBody.includes(article.disclosure));
  assert.ok(schema.articleBody.includes(article.companyList.items[0].question));
  assert.deepEqual(schema.about, { "@id": list["@id"] });
  assert.equal(JSON.stringify(page.schema).includes("aggregateRating"), false);
  assert.ok(magazineCard(article).includes("محتوى ترويجي"));
  assert.ok(page.body.includes('href="#section-10"><span>10</span>'));
  assert.equal(page.body.includes('<span>010</span>'), false);
});

test("new comparison and section-link fields escape text and attribute delimiters", () => {
  const name = '<img src=x onerror="alert(1)">';
  const url = 'https://example.com/?a=1&b="quoted"';
  const fixture = {
    ...article, sources: [{ name, url }],
    companyList: { title: name, items: [{ name, url, focus: name, question: name }] },
    sections: [{ title: "مقارنة", comparison: true, links: [{ name, url }] }],
  };
  const page = magazineArticleModel(fixture);
  assert.equal(page.body.includes(name), false);
  assert.ok(page.body.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
  assert.ok(page.body.includes('href="https://example.com/?a=1&amp;b=&quot;quoted&quot;"'));
});

test("editorial publication dates stay current and ordinary articles keep their presentation", () => {
  assert.equal(articleDate(article), "2026-11-03");
  assert.ok(magazineCard(article).includes('<time datetime="2026-11-03">'));
  assert.ok(magazineFeed().includes(articlePath(article)));
  const ordinary = editorialArticles.find(entry => !entry.disclosure);
  const page = magazineArticleModel(ordinary);
  assert.equal(page.body.includes('class="rt-promotional-disclosure"'), false);
  assert.equal(page.body.includes('class="rt-comparison"'), false);
  assert.equal(page.schema.some(node => node?.["@type"] === "ItemList"), false);
});
