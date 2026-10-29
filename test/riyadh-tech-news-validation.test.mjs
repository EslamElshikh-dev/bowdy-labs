import { test } from "node:test";
import assert from "node:assert/strict";
import sourceConfig from "../src/data/riyadh-tech-sources.json" with { type: "json" };
import { validateAutomaticNews, validateNewsSourceRegistry, newsSources, newsSourceIds } from "../src/riyadh-tech-news-validation.mjs";

const now = Date.parse("2026-10-18T12:00:00Z");
const fixture = () => ({ schemaVersion: 1, articles: [{
  sourceId: "openai", sourceUrl: "https://openai.com/index/validation-example/",
  sourceTitle: "An official announcement for validation tests",
  title: "خبر تجريبي للتحقق من بيانات المصادر المعتمدة",
  excerpt: "ملخص عربي تجريبي يتحقق من صحة بيانات الأخبار قبل إضافتها إلى أرشيف المجلة ونشرها على الموقع.",
  eventDate: "2026-10-17", publishedAt: "2026-10-17T10:00:00+03:00",
  paragraphs: ["هذه فقرة عربية تجريبية لاختبار مسار التحقق المبكر من الأخبار، ولا يتم نشرها أو إضافتها إلى أرشيف المجلة الحقيقي."],
}] });
const validate = data => validateAutomaticNews(data, { now, excludedUrls: [] });

test("rejects the google sourceId regression with the article location and approved IDs", () => {
  const data = fixture();
  data.articles[0].sourceId = "google";
  data.articles[0].sourceUrl = "https://blog.google/technology/ai/validation-example/";
  assert.throws(() => validate(data), error => {
    assert.match(error.message, /articles\[0\].*Unknown automatic-news sourceId "google"/);
    assert.ok(error.message.includes(`approved source IDs: ${newsSourceIds.join(", ")}`));
    return true;
  });
  data.articles[0].sourceId = "google-ai";
  assert.equal(validate(data)[0].source.id, "google-ai");
});

test("accepts every registered source without keeping a second source ID list", () => {
  for (const source of newsSources) {
    const data = fixture();
    Object.assign(data.articles[0], { sourceId: source.id, sourceUrl: `https://${source.domains[0]}${source.pathPrefixes[0]}validation-example` });
    assert.equal(validate(data)[0].source, source);
  }
});

test("rejects missing, misspelled, padded and non-string source IDs", () => {
  for (const sourceId of [undefined, null, 12, {}, "", "OpenAI", " google-ai ", "unknown-source", "__proto__"]) {
    const data = fixture();
    data.articles[0].sourceId = sourceId;
    assert.throws(() => validate(data), /articles\[0\].*sourceId/);
  }
});

test("rejects malformed documents and article records with a useful location", () => {
  for (const data of [null, {}, [], { schemaVersion: 2, articles: [] }, { schemaVersion: 1, articles: {} }]) assert.throws(() => validate(data), /Unsupported/);
  for (const item of [null, [], "invalid"]) assert.throws(() => validate({ schemaVersion: 1, articles: [item] }), /articles\[0\]: Article must be an object/);
});

test("rejects malformed required fields before rendering", () => {
  for (const patch of [
    { sourceUrl: null }, { sourceUrl: "https://openai.com/index/validation-example/ " },
    { sourceTitle: undefined }, { title: "قصير" }, { excerpt: "قصير" },
    { eventDate: "2026-02-31" }, { publishedAt: "2026-02-31T10:00:00Z" },
    { publishedAt: "2026-10-17T10:00:00" }, { publishedAt: "2026-10-19T10:00:00Z" },
    { publishedAt: "2026-10-17T24:00:00Z" },
    { paragraphs: null }, { paragraphs: [null] }, { paragraphs: Array(4).fill("فقرة") },
  ]) {
    const data = fixture();
    Object.assign(data.articles[0], patch);
    assert.throws(() => validate(data), /articles\[0\]:/);
  }
});

test("rejects duplicate normalized headlines and overlong summaries", () => {
  const data = fixture();
  data.articles.push({ ...data.articles[0], sourceUrl: "https://openai.com/index/another-validation/", title: `${data.articles[0].title}ـ` });
  assert.throws(() => validate(data), /articles\[1\].*Duplicate.*headline/);
  data.articles = [data.articles[0]];
  data.articles[0].paragraphs = [Array(141).fill("كلمة").join(" ")];
  assert.throws(() => validate(data), /editorial length limit/);
});

test("source registry rejects duplicate IDs, invalid shapes, unsafe URLs and unsupported artwork", () => {
  assert.equal(validateNewsSourceRegistry(sourceConfig), sourceConfig);
  const invalid = [
    config => { config.schemaVersion = 2; },
    config => { config.sources = []; },
    config => { config.sources.push(structuredClone(config.sources[0])); },
    config => { config.sources[0].id = "Google AI"; },
    config => { config.sources[0].art = "missing-art"; },
    config => { config.sources[0].domains = ["*.openai.com"]; },
    config => { config.sources[0].domains = []; },
    config => { config.sources[0].pathPrefixes = ["index/"]; },
    config => { config.sources[0].pathPrefixes = ["/index/?redirect="]; },
    config => { config.sources[0].homepage = "https://evil.example/news/"; },
    config => { config.sources[0].feed = "http://openai.com/news/rss.xml"; },
    config => { config.sources.find(source => source.id === "huggingface").trustedOrganizations = []; },
    config => { config.pollIntervalHours = 0; },
    config => { config.maxArticlesPerRun = "8"; },
    config => { config.editorialSourceUrls.push(config.editorialSourceUrls[0]); },
  ];
  for (const change of invalid) {
    const config = structuredClone(sourceConfig);
    change(config);
    assert.throws(() => validateNewsSourceRegistry(config));
  }
});
