import { magazine, magazineArticles, articlePath, articlePublishedAt } from "./riyadh-tech-content.mjs";
import { newsSources } from "./riyadh-tech-news.mjs";

export const magazineSections = [
  { id: "news", label: "أخبار الذكاء الاصطناعي", short: "الأخبار", kicker: "THE AI SIGNAL", description: "تابع إعلانات نماذج الذكاء الاصطناعي وأدواته وأبحاثه وتطبيقاته، بملخصات عربية تربط كل خبر بمصدره وتوضح تاريخ الإعلان الأصلي.", accent: "#81b6ff" },
  { id: "explainers", label: "نفهم التقنية", short: "شروحات", kicker: "UNDERSTAND THE TECHNOLOGY", description: "شروحات عربية لفهم الوكلاء والاسترجاع المعزز بالتوليد والأفكار التقنية، مع أمثلة تساعدك على الانتقال من المصطلح إلى الاستخدام.", accent: "#78d5e6" },
  { id: "tools", label: "نماذج وأدوات", short: "نماذج وأدوات", kicker: "THE BUILDER'S TOOLBOX", description: "أدلة لاختيار نماذج الذكاء الاصطناعي وتقييم الأدوات على مهامك، مع التركيز على جودة العربية والتكلفة والوقت ومعايير القبول.", accent: "#b6a0fc" },
  { id: "business", label: "الذكاء في الأعمال", short: "للأعمال", kicker: "FROM KNOWLEDGE TO IMPACT", description: "اقرأ كيف تبدأ تجربة ذكاء اصطناعي في بيئة العمل، وتحدد المشكلة والبيانات والمسؤول ومعيار النجاح قبل اختيار التقنية أو توسيع استخدامها.", accent: "#edcf92" },
];
export const sectionPath = id => `${magazine.path}${id}/`;
export const sourcePath = source => `${magazine.path}sources/${source.id}/`;
export const pagePath = (base, page = 1) => page === 1 ? base : `${base}page/${page}/`;
export const PAGE_SIZE = 12;

export function paginateArticles(items, { page = 1, size = PAGE_SIZE } = {}) {
  if (!Number.isInteger(size) || size < 1 || !Number.isInteger(page) || page < 1) throw new RangeError("Invalid magazine page");
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  if (page > totalPages) throw new RangeError("Magazine page is out of range");
  return { items: items.slice((page - 1) * size, page * size), page, size, total: items.length, totalPages };
}

const hostname = value => { try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return ""; } };
export function articleSourceIds(article) {
  const result = new Set(article.sourceId ? [article.sourceId] : []);
  for (const source of newsSources) if (article.sources.some(reference => source.domains.some(domain => domain.replace(/^www\./, "") === hostname(reference.url)))) result.add(source.id);
  return [...result];
}
export const articlesForSource = source => magazineArticles.filter(article => articleSourceIds(article).includes(source.id));
export const articlesForSection = id => magazineArticles.filter(article => article.category === id);

export function recommendedArticles(article, limit = 3) {
  const sourceIds = articleSourceIds(article);
  const score = candidate => Number(candidate.category === article.category) * 3 + Number(candidate.kind === article.kind) + articleSourceIds(candidate).filter(id => sourceIds.includes(id)).length;
  return magazineArticles.filter(candidate => candidate.slug !== article.slug).sort((a, b) => score(b) - score(a) || Date.parse(articlePublishedAt(b)) - Date.parse(articlePublishedAt(a))).slice(0, limit);
}

export const articleNeighbors = article => {
  const index = magazineArticles.findIndex(candidate => candidate.slug === article.slug);
  return { newer: index > 0 ? magazineArticles[index - 1] : null, older: index >= 0 ? magazineArticles[index + 1] ?? null : null };
};

export function listingDefinitions() {
  return [
    ...magazineSections.map(section => ({ ...section, path: sectionPath(section.id), items: articlesForSection(section.id), type: "section" })),
    { id: "archive", label: "أرشيف المجلة", kicker: "THE READING ARCHIVE", description: "تصفح كل ما نشرته مجلة رياض التقنية من أخبار وشروحات وأدلة، مرتبة بحسب تاريخ النشر في المجلة، مع وصول مباشر إلى المقال ومصدره.", path: `${magazine.path}archive/`, items: magazineArticles, type: "archive" },
    ...newsSources.map(source => ({ id: source.id, label: `أخبار وموضوعات ${source.name}`, kicker: "FROM THE ORIGINAL SOURCE", description: `موضوعات مجلة رياض التقنية التي تستند إلى ${source.name}، مع روابط مباشرة إلى الإعلانات والمراجع الأصلية وتمييز الأخبار الآلية عن الشروحات التحريرية.`, path: sourcePath(source), items: articlesForSource(source), type: "source", source })),
  ];
}

export const magazineArticleRoutes = () => magazineArticles.map(articlePath);
