import test from "node:test";
import assert from "node:assert/strict";
import { magazineIndexModel, magazineArticleModel, magazineStyles, esc } from "../src/riyadh-tech-page.mjs";
import { magazineArticles, articlePath, articlePublishedAt } from "../src/riyadh-tech-content.mjs";
import { newsSources } from "../src/riyadh-tech-news.mjs";
import { sourcePath } from "../src/riyadh-tech-routing.mjs";

test("the static news brief uses the three latest published stories and real dates", () => {
  const body = magazineIndexModel().body;
  const brief = body.match(/<section class="rt-dispatches"[\s\S]*?<\/section>/)?.[0];
  assert.ok(brief);
  assert.equal((brief.match(/<li>/g) ?? []).length, 3);
  let previous = -1;
  for (const article of magazineArticles.slice(0, 3)) {
    const position = brief.indexOf(`href="${articlePath(article)}"`);
    assert.ok(position > previous, "publication order is preserved");
    previous = position;
    assert.ok(brief.includes(esc(article.title)));
    assert.ok(brief.includes(`datetime="${articlePublishedAt(article)}"`));
  }
  assert.ok(!brief.includes(" hidden"), "the brief works without JavaScript");
});

test("source navigation derives every link from the actual source registry", () => {
  const rail = magazineIndexModel().body.match(/<nav class="rt-source-rail"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(rail);
  assert.equal((rail.match(/<li>/g) ?? []).length, newsSources.length);
  for (const source of newsSources) {
    assert.ok(rail.includes(`href="${sourcePath(source)}"`));
    assert.ok(rail.includes(`<bdi>${esc(source.name)}</bdi>`));
  }
});

test("the shared design layer keeps reader controls and automatic attribution intact", () => {
  assert.ok(magazineStyles.some(path => path.startsWith("/assets/css/riyadh-tech-atelier.css?v=")));
  const article = magazineArticles.find(article => article.automated);
  const page = magazineArticleModel(article);
  assert.deepEqual(page.styles, magazineStyles);
  assert.ok(page.body.includes('data-reader-theme="paper"'));
  assert.ok(page.body.includes('data-reader-tools hidden'));
  assert.ok(page.body.includes('دون مراجعة بشرية قبل النشر'));
  for (const source of article.sources) assert.ok(page.body.includes(`href="${esc(source.url)}"`));
});
