import newsData from "./data/riyadh-tech-news.json" with { type: "json" };
import { validateAutomaticNews, automaticSlug } from "./riyadh-tech-news-validation.mjs";

export { validateAutomaticNews, canonicalSourceUrl, automaticSlug, newsSources, newsSourceIds, newsPolicy, validateNewsSourceRegistry } from "./riyadh-tech-news-validation.mjs";

export const automaticNews = validateAutomaticNews(newsData);
export const lastAutomaticPublication = automaticNews.reduce((latest, a) => !latest || Date.parse(a.publishedAt) > Date.parse(latest) ? a.publishedAt : latest, null);
export const automaticArticles = automaticNews.map(item => ({
  slug: automaticSlug(item.sourceUrl), title: item.title, excerpt: item.excerpt,
  kind: "news", category: "news", categoryLabel: "أخبار الذكاء الاصطناعي", automated: true, sourceId: item.sourceId,
  tag: item.source.name, art: item.source.art, visual: item.source.visual, label: "AUTOMATED NEWS BRIEF",
  eventDate: item.eventDate, publishedAt: item.publishedAt, modifiedAt: item.publishedAt,
  takeaway: item.excerpt, sources: [{ name: `${item.source.name}: ${item.sourceTitle}`, url: item.sourceUrl, date: item.eventDate }],
  sections: [{ title: "ملخص الإعلان", paragraphs: item.paragraphs }],
}));
