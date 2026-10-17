import { test } from "node:test";
import assert from "node:assert/strict";
import { magazineArticles, articlePath } from "../src/riyadh-tech-content.mjs";
import { newsSources } from "../src/riyadh-tech-news.mjs";
import { magazineSections, pagePath, paginateArticles, listingDefinitions, articleSourceIds, recommendedArticles, articleNeighbors } from "../src/riyadh-tech-routing.mjs";
import { magazineExtraPageModels } from "../src/riyadh-tech-sections.mjs";

test("archive pagination does not lose or repeat articles", () => {
  const stories=Array.from({length:41}, (_,id)=>({id}));
  const pages=Array.from({length:4},(_,i)=>paginateArticles(stories,{page:i+1}));
  assert.deepEqual(pages.map(page=>page.items.length),[12,12,12,5]);
  assert.deepEqual(pages.flatMap(page=>page.items),stories);
  assert.equal(pagePath("/riyadh-tech/archive/",1),"/riyadh-tech/archive/");
  assert.equal(pagePath("/riyadh-tech/archive/",2),"/riyadh-tech/archive/page/2/");
  for(const options of [{page:0},{page:1.5},{page:5},{size:0},{size:1.2}]) assert.throws(()=>paginateArticles(stories,options),RangeError);
});
test("empty source archives keep a useful first page", () => {
  const page=paginateArticles([]);
  assert.equal(page.totalPages,1);
  assert.equal(page.items.length,0);
  assert.throws(()=>paginateArticles([],{page:2}),RangeError);
});
test("sources match exact official domains, including www variants", () => {
  assert.ok(articleSourceIds({sources:[{url:"https://www.openai.com/index/example/"}]}).includes("openai"));
  for(const url of ["https://openai.com.evil.example/x","https://notopenai.com/x","not a url"]) assert.ok(!articleSourceIds({sources:[{url}]}).includes("openai"));
  assert.deepEqual(articleSourceIds({sources:[]}),[]);
});
test("every story belongs to a real section and its source archives", () => {
  const definitions=listingDefinitions();
  for(const story of magazineArticles){
    assert.ok(magazineSections.some(section=>section.id===story.category));
    assert.ok(definitions.find(section=>section.type==="section"&&section.id===story.category).items.includes(story));
    for(const id of articleSourceIds(story)){
      assert.ok(newsSources.some(source=>source.id===id));
      assert.ok(definitions.find(section=>section.type==="source"&&section.id===id).items.includes(story));
    }
  }
});
test("recommendations exclude the current article and adjacent navigation has valid boundaries", () => {
  for(const [index,story] of magazineArticles.entries()){
    const related=recommendedArticles(story);
    assert.equal(new Set(related.map(articlePath)).size,related.length);
    assert.ok(related.every(candidate=>candidate.slug!==story.slug));
    assert.ok(related.length<=3);
    const neighbors=articleNeighbors(story);
    assert.equal(neighbors.newer,magazineArticles[index-1]??null);
    assert.equal(neighbors.older,magazineArticles[index+1]??null);
  }
});
test("hub routes are unique, disjoint from articles, and indexing avoids empty archives", () => {
  const pages=magazineExtraPageModels();
  const paths=pages.map(page=>page.path);
  assert.equal(new Set(paths).size,paths.length);
  assert.ok(paths.every(path=>!magazineArticles.some(article=>articlePath(article)===path)));
  for(const path of ["search","saved"]) assert.equal(pages.find(page=>page.path===`/riyadh-tech/${path}/`).indexable,false);
  for(const source of listingDefinitions().filter(definition=>definition.type==="source"&&definition.items.length===0)) assert.equal(pages.find(page=>page.path===source.path).indexable,false);
  assert.ok(pages.find(page=>page.path==="/riyadh-tech/about/").indexable);
});
