import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAutomaticNews, canonicalSourceUrl, automaticSlug, automaticNews, newsSources } from "../src/riyadh-tech-news.mjs";

const now = Date.parse("2026-10-18T12:00:00Z");
const fixture = () => ({ schemaVersion: 1, articles: [{ sourceId: "openai", sourceUrl: "https://openai.com/index/example-news/", sourceTitle: "A verified example announcement", title: "إعلان تجريبي لاختبار قواعد الأخبار الآلية", excerpt: "ملخص عربي تجريبي يوضح محتوى الإعلان ويستخدم لاختبار قواعد التحقق من الأخبار في المجلة.", eventDate: "2026-10-17", publishedAt: "2026-10-17T10:00:00+03:00", paragraphs: ["هذه فقرة اختبار عربية كافية للتحقق من شكل البيانات، ولا تُنشر ضمن أخبار الموقع أو تظهر في صفحات المجلة."] }] });
const validate = d => validateAutomaticNews(d, { now, excludedUrls: [] });

test("canonical URL ignores tracking, fragments, www and trailing slashes", () => {
  assert.equal(canonicalSourceUrl("https://www.openai.com/index/story/?utm_source=mail&fbclid=x#part"), "https://openai.com/index/story");
  assert.equal(automaticSlug("https://openai.com/index/story/"), automaticSlug("https://www.openai.com/index/story?utm_medium=rss"));
});
test("rejects a duplicate announcement despite different URL tracking", () => {
  const data = fixture(); data.articles.push({ ...data.articles[0], sourceUrl: "https://www.openai.com/index/example-news?utm_source=rss", title: "عنوان عربي مختلف لنفس الإعلان المكرر" });
  assert.throws(() => validate(data), /Duplicate/);
});
test("rejects a duplicate of an existing editorial story", () => {
  const data = fixture();
  assert.throws(() => validateAutomaticNews(data, { now, excludedUrls: [data.articles[0].sourceUrl] }), /Duplicate/);
});
test("rejects source impersonation and embedded URL credentials", () => {
  for (const sourceUrl of ["https://openai.com.evil.example/index/story", "https://evil.example/index/story", "https://user:pass@openai.com/index/story", "http://openai.com/index/story", "https://openai.com:8443/index/story"]) {
    const data = fixture(); data.articles[0].sourceUrl = sourceUrl; assert.throws(() => validate(data));
  }
});
test("rejects future publication and impossible source dates", () => {
  for (const patch of [{publishedAt:"2026-10-19T10:00:00Z"},{eventDate:"2026-02-31"},{eventDate:"2026-10-18"}]) {
    const data=fixture();Object.assign(data.articles[0],patch);assert.throws(()=>validate(data));
  }
});
test("rejects HTML and incomplete or non-Arabic summaries", () => {
  for (const patch of [{title:'<script>alert(1)</script>'},{title:'This title has no Arabic text'},{paragraphs:[]},{excerpt:'short'}]) {
    const data=fixture();Object.assign(data.articles[0],patch);assert.throws(()=>validate(data));
  }
});
test("rejects arbitrary Hugging Face community authors", () => {
  const data=fixture();Object.assign(data.articles[0],{sourceId:"huggingface",sourceUrl:"https://huggingface.co/blog/unknown-user/story"});assert.throws(()=>validate(data),/Unapproved/);
});
test("accepts an official article and derives stable route IDs", () => {
  const item=validate(fixture())[0];assert.equal(item.source.name,"OpenAI");assert.match(automaticSlug(item.sourceUrl),/^news-[a-f0-9]{16}$/);
});
test("seed data contains verified sources with distinct canonical URLs", () => {
  assert.equal(new Set(automaticNews.map(a=>a.sourceUrl)).size,automaticNews.length);
  assert.ok(automaticNews.length>=3);assert.equal(newsSources.length,7);
});
