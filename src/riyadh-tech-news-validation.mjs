import { createHash } from "node:crypto";
import sourceConfig from "./data/riyadh-tech-sources.json" with { type: "json" };

const allowedArt = new Set(["argon", "interface", "haiku", "agents", "knowledge", "evaluation", "business"]);
const tracking = /^(utm_|fbclid$|gclid$|ref$|referrer$|source$)/i;
const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const record = value => value !== null && typeof value === "object" && !Array.isArray(value);

// This JSON registry is the only list of approved source IDs, for both the
// publisher preflight and the build. Do not add aliases such as "google" here.
export function validateNewsSourceRegistry(config) {
  if (!record(config) || config.schemaVersion !== 1 || !Array.isArray(config.sources) || !config.sources.length) throw new Error("Unsupported news source registry");
  const ids = new Set();
  for (const [index, source] of config.sources.entries()) {
    const field = `sources[${index}]`;
    if (!record(source) || typeof source.id !== "string" || !identifier.test(source.id)) throw new Error(`${field}.id must be a lowercase source identifier`);
    if (ids.has(source.id)) throw new Error(`${field}.id duplicates source ID ${JSON.stringify(source.id)}`);
    ids.add(source.id);
    for (const key of ["name", "visual"]) text(source[key], 1, 100, `${field}.${key}`);
    if (!allowedArt.has(source.art)) throw new Error(`${field}.art is not a supported magazine illustration`);
    if (!Array.isArray(source.domains) || !source.domains.length || source.domains.some(domain => typeof domain !== "string" || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain))) throw new Error(`${field}.domains must contain exact lowercase hostnames`);
    if (!Array.isArray(source.pathPrefixes) || !source.pathPrefixes.length || source.pathPrefixes.some(prefix => typeof prefix !== "string" || !prefix.startsWith("/") || /[\s?#\\]/u.test(prefix))) throw new Error(`${field}.pathPrefixes must contain absolute URL paths`);
    for (const key of ["homepage", "feed"]) {
      if (key === "feed" && source.feed === null) continue;
      try {
        const url = new URL(canonicalSourceUrl(source[key]));
        if (!source.domains.some(domain => domain.replace(/^www\./, "") === url.hostname)) throw new Error("URL must use an approved source domain");
      } catch (error) {
        throw new Error(`${field}.${key}: ${error.message}`, { cause: error });
      }
    }
    if (source.id === "huggingface" || source.trustedOrganizations !== undefined) {
      if (!Array.isArray(source.trustedOrganizations) || !source.trustedOrganizations.length || source.trustedOrganizations.some(id => typeof id !== "string" || !identifier.test(id))) throw new Error(`${field}.trustedOrganizations must list approved author identifiers`);
    }
  }
  for (const field of ["pollIntervalHours", "maxArticlesPerRun", "lookbackHours"]) {
    if (!Number.isSafeInteger(config[field]) || config[field] < 1) throw new Error(`Invalid news source registry ${field}`);
  }
  if (!Array.isArray(config.editorialSourceUrls)) throw new Error("News source registry requires editorialSourceUrls");
  const urls = config.editorialSourceUrls.map(canonicalSourceUrl);
  if (new Set(urls).size !== urls.length) throw new Error("Duplicate editorial source URL in news source registry");
  return config;
}

export const newsPolicy = validateNewsSourceRegistry(sourceConfig);
export const newsSources = newsPolicy.sources;
export const newsSourceIds = Object.freeze(newsSources.map(source => source.id));
const sourcesById = new Map(newsSources.map(source => [source.id, source]));

export function canonicalSourceUrl(value) {
  if (typeof value !== "string" || value.trim() !== value) throw new Error("Source URL must be a string without surrounding whitespace");
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

export function validateAutomaticNews(data, { now = Date.now(), excludedUrls = newsPolicy.editorialSourceUrls } = {}) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.articles)) throw new Error("Unsupported automatic-news document");
  const seen = new Set(excludedUrls.map(canonicalSourceUrl));
  const seenHeadlines = new Set();
  return data.articles.map((item, index) => {
    try {
      if (!record(item)) throw new Error("Article must be an object");
      const source = sourcesById.get(item.sourceId);
      if (!source) throw new Error(`Unknown automatic-news sourceId ${JSON.stringify(item.sourceId)}; approved source IDs: ${newsSourceIds.join(", ")}`);
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
      if (!validDate(item.eventDate)) throw new Error("Invalid source eventDate");
      if (typeof item.publishedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(item.publishedAt) || !validDate(item.publishedAt.slice(0, 10)) || !Number.isFinite(Date.parse(item.publishedAt)) || Date.parse(item.publishedAt) > now + 5 * 60 * 1000) throw new Error("Invalid or future magazine publishedAt");
      const publicationDay = new Date(Date.parse(item.publishedAt) + 3 * 3600 * 1000).toISOString().slice(0, 10);
      if (item.eventDate > publicationDay) throw new Error("Source date is later than magazine publication");
      if (!Array.isArray(item.paragraphs) || item.paragraphs.length < 1 || item.paragraphs.length > 3) throw new Error("Automatic news requires one to three paragraphs");
      item.paragraphs.forEach(p => text(p, 40, 1100, "paragraph"));
      if (item.paragraphs.join(" ").split(/\s+/u).length > 140) throw new Error("Automatic-news summary exceeds the editorial length limit");
      return { ...item, sourceUrl: canonical, source };
    } catch (error) {
      throw new Error(`articles[${index}]: ${error.message}`, { cause: error });
    }
  });
}

function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

