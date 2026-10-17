import { createHash } from "node:crypto";
import sourceConfig from "./data/riyadh-tech-sources.json" with { type: "json" };
import newsData from "./data/riyadh-tech-news.json" with { type: "json" };

export const newsSources = sourceConfig.sources;
export const newsPolicy = sourceConfig;
const allowedArt = new Set(["argon", "interface", "haiku", "agents", "knowledge", "evaluation", "business"]);
const tracking = /^(utm_|fbclid$|gclid$|ref$|referrer$|source$)/i;

export function canonicalSourceUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error("Source URL must be public HTTPS without credentials or a custom port");
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) if (tracking.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
}

export const automaticSlug = (sourceUrl) => `news-${createHash("sha256").update(canonicalSourceUrl(sourceUrl)).digest("hex").slice(0, 16)}`;

function text(value, min, max, field) {
  if (typeof value !== "string" || value.trim() !== value || value.length < min || value.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value)) throw new Error(`Invalid automatic-news ${field}`);
  if (/<\/?[a-z][^>]*>/iu.test(value)) throw new Error(`HTML is not accepted in automatic-news ${field}`);
  return value;
}

export function validateAutomaticNews(data, { now = Date.now(), excludedUrls = sourceConfig.editorialSourceUrls } = {}) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.articles)) throw new Error("Unsupported automatic-news document");
  const seen = new Set(excludedUrls.map(canonicalSourceUrl));
  const seenHeadlines = new Set();
  return data.articles.map(item => {
    const source = newsSources.find(s => s.id === item.sourceId);
    if (!source || !allowedArt.has(source.art)) throw new Error("Unknown automatic-news source");
    const canonical = canonicalSourceUrl(item.sourceUrl);
    const url = new URL(canonical);
    if (!source.domains.some(domain => domain.replace(/^www\./, "") === url.hostname) || !source.pathPrefixes.some(prefix => url.pathname.startsWith(prefix))) throw new Error("Automatic-news URL is outside its approved source");
    if (source.id === "huggingface") {
      const authorPath = url.pathname.split("/").filter(Boolean);
      if (authorPath.length > 2 && !source.trustedOrganizations.includes(authorPath[1])) throw new Error("Unapproved community author");
    }
    if (seen.has(canonical)) throw new Error("Duplicate automatic-news source URL");
    seen.add(canonical);
    const title = text(item.title, 15, 125, "title");
    const headlineKey = title.normalize("NFKC").replace(/[\u064B-\u065F\u0640]/gu, "").toLowerCase();
    if (seenHeadlines.has(headlineKey)) throw new Error("Duplicate automatic-news headline");
    seenHeadlines.add(headlineKey);
    text(item.sourceTitle, 8, 350, "sourceTitle");
    text(item.excerpt, 45, 220, "excerpt");
    if (!/[\u0621-\u064A]/u.test(title) || !/[\u0621-\u064A]/u.test(item.excerpt)) throw new Error("Automatic-news summaries must be in Arabic");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.eventDate) || Number.isNaN(Date.parse(item.eventDate)) || new Date(item.eventDate).toISOString().slice(0, 10) !== item.eventDate) throw new Error("Invalid source event date");
    if (typeof item.publishedAt !== "string" || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(item.publishedAt) || !Number.isFinite(Date.parse(item.publishedAt)) || Date.parse(item.publishedAt) > now + 5 * 60 * 1000) throw new Error("Invalid or future magazine publication time");
    const publicationDay = new Date(Date.parse(item.publishedAt) + 3 * 3600 * 1000).toISOString().slice(0, 10);
    if (item.eventDate > publicationDay) throw new Error("Source date is later than magazine publication");
    if (!Array.isArray(item.paragraphs) || item.paragraphs.length < 1 || item.paragraphs.length > 3) throw new Error("Automatic news requires one to three paragraphs");
    item.paragraphs.forEach(p => text(p, 40, 1100, "paragraph"));
    if (item.paragraphs.join(" ").split(/\s+/u).length > 140) throw new Error("Automatic-news summary exceeds the editorial length limit");
    return { ...item, sourceUrl: canonical, source };
  });
}

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
