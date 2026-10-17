import { site } from "./content.mjs";
import { magazine, magazineArticles, articlePath, articleDate, articlePublishedAt, articleModifiedAt, articleShareImage, magazineUpdatedAt, readingMinutes, formatDate } from "./riyadh-tech-content.mjs";

import { newsSources, newsPolicy, lastAutomaticPublication } from "./riyadh-tech-news.mjs";

const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>';
const clock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>';
const search = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>';
const periodicalId = `${site.url}${magazine.path}#magazine`;
const editorId = `${site.url}${magazine.path}#editorial-team`;
const styles = ["/assets/css/riyadh-tech.css?v=20261017-2"];
const scripts = ["/assets/js/riyadh-tech.js?v=20261017-1"];
const autoEditor = { "@type": "Organization", "@id": `${site.url}${magazine.path}#automatic-desk`, name: "الرصد الآلي لمجلة رياض التقنية", url: `${site.url}${magazine.path}#news-sources`, parentOrganization: { "@id": `${site.url}/#organization` } };
const editor = { "@type": "Organization", "@id": editorId, name: magazine.editor, url: `${site.url}${magazine.path}#editorial`, parentOrganization: { "@id": `${site.url}/#organization` } };
const periodical = { "@type": "Periodical", "@id": periodicalId, name: magazine.name, url: `${site.url}${magazine.path}`, inLanguage: "ar-SA", description: magazine.description, publisher: { "@id": `${site.url}/#organization` } };

function crumbs(article) {
  return `<nav class="rt-crumbs" aria-label="مسار التنقل"><ol><li><a href="/">باودي لابز</a></li><li>${article ? `<a href="${magazine.path}">${magazine.name}</a>` : `<span aria-current="page">${magazine.name}</span>`}</li>${article ? `<li><span aria-current="page">${esc(article.title)}</span></li>` : ""}</ol></nav>`;
}

function breadcrumbSchema(article) {
  const path = article ? articlePath(article) : magazine.path;
  return { "@type": "BreadcrumbList", "@id": `${site.url}${path}#breadcrumb`, itemListElement: [
    { "@type": "ListItem", position: 1, name: site.nameAr, item: `${site.url}/` },
    { "@type": "ListItem", position: 2, name: magazine.name, item: `${site.url}${magazine.path}` },
    ...(article ? [{ "@type": "ListItem", position: 3, name: article.title, item: `${site.url}${path}` }] : []),
  ] };
}

function art(article, { featured = false } = {}) {
  return `<div class="rt-art rt-art--${article.art}${featured ? " rt-art--featured" : ""}" aria-hidden="true">
    <svg class="rt-art-orbit" viewBox="0 0 600 360" fill="none"><g stroke="currentColor"><ellipse cx="300" cy="180" rx="165" ry="105" transform="rotate(-25 300 180)"/><ellipse cx="300" cy="180" rx="165" ry="105" transform="rotate(25 300 180)"/><ellipse cx="300" cy="180" rx="105" ry="165"/><circle cx="300" cy="180" r="75"/><path d="M30 180h160m220 0h160M300 10v60m0 220v60M75 40l100 65m250 150 100 65" opacity=".35"/></g><g fill="currentColor"><circle cx="163" cy="112" r="5"/><circle cx="437" cy="248" r="5"/><circle cx="300" cy="15" r="4"/><circle cx="465" cy="180" r="4"/></g></svg>
    <span class="rt-art-label" lang="en" dir="ltr">${esc(article.label)}</span><strong class="rt-art-word" lang="en" dir="ltr">${esc(article.visual)}</strong><span class="rt-art-caption" lang="en" dir="ltr">RIYADH TECH <i>↗</i></span>
  </div>`;
}

function meta(article) {
  return `<div class="rt-meta"><span>${article.automated ? "خبر آلي" : article.kind === "news" ? "خبر" : "مقال"}</span><span>${clock}${readingMinutes(article)} د قراءة</span><time datetime="${articleDate(article)}">${formatDate(articleDate(article))}</time></div>`;
}

function card(article, { filterable = false } = {}) {
  const path = articlePath(article);
  return `<article class="rt-card"${filterable ? ` data-magazine-card data-category="${article.category}" data-search="${esc([article.title, article.excerpt, article.tag, article.visual, article.categoryLabel].join(" "))}"` : ""}>
    <a class="rt-card-art" href="${path}" tabindex="-1" aria-hidden="true">${art(article)}</a><div class="rt-card-content"><div class="rt-card-top"><span class="rt-category">${article.categoryLabel}</span><span>${esc(article.tag)}</span></div><h3><a href="${path}">${esc(article.title)}</a></h3><p>${esc(article.excerpt)}</p><div class="rt-card-bottom">${meta(article)}<a class="rt-arrow" href="${path}" aria-label="اقرأ: ${esc(article.title)}">${arrow}</a></div></div>
  </article>`;
}

function editorial() {
  return `<section class="rt-editorial" id="editorial" aria-labelledby="rt-editorial-title"><div class="rt-editorial-intro"><span class="rt-kicker">منهجنا التحريري</span><h2 id="rt-editorial-title">خبر له مصدر.<br>وفكرة تستحق الفهم.</h2><p>مجلة رياض التقنية منصة تحريرية من باودي لابز، تتابع الذكاء الاصطناعي وتشرح ما يعنيه للمطورين وفرق الأعمال والقارئ العربي.</p></div><div class="rt-principles"><article><span>01</span><div><h3>نرجع إلى الأصل</h3><p>نربط الأخبار بالإعلانات والوثائق الرسمية، ونوضح تاريخ الحدث وتاريخ النشر في المجلة.</p></div></article><article><span>02</span><div><h3>نوضح زاوية القراءة</h3><p>نميز بين ما تعلنه الشركات وقراءة المجلة، ولا ننسب لأنفسنا اختبارات لم نجرها.</p></div></article><article><span>03</span><div><h3>المعرفة قابلة للمراجعة</h3><p>الشروحات أصلية، والملخصات الآلية موسومة بوضوح وتُربط بمصادرها. وتصحيح المعلومات مرحب به عبر <a href="mailto:${site.email}?subject=${encodeURIComponent("تصحيح في مجلة رياض التقنية")}">بريد التحرير</a>.</p></div></article></div></section>`;
}


function automaticNotice() {
  return `<div class="rt-auto-notice"><span><i aria-hidden="true"></i>رصد ونشر تلقائي · كل ساعة</span><a href="#news-sources">${newsSources.length} مصادر رسمية ↗</a>${lastAutomaticPublication ? `<small>آخر نشر آلي: <time datetime="${lastAutomaticPublication}">${formatDate(lastAutomaticPublication)}</time></small>` : ""}</div>`;
}

function sourcePanel() {
  return `<section class="rt-source-panel" id="news-sources"><details><summary>مصادر الأخبار وطريقة النشر التلقائي <span aria-hidden="true">+</span></summary><div><p>نفحص المصادر كل ساعة، وننشر ملخصات عربية للأخبار الجديدة المرتبطة بالذكاء الاصطناعي، مع المصدر وتاريخ الإعلان. نستخدم RSS عندما تتوفر، وصفحة الأخبار الرسمية عند عدم توفر خلاصة مناسبة.</p><ul>${newsSources.map(source => `<li><a href="${source.homepage}" target="_blank" rel="noopener noreferrer">${source.name} ↗</a><span>${source.feed ? "خلاصة RSS رسمية" : "صفحة الأخبار الرسمية"}</span></li>`).join("")}</ul><p>الملخصات الموسومة «نشر تلقائي» لم تخضع لمراجعة بشرية قبل النشر. الأخبار المكررة والمعلومات غير المؤكدة لا تُنشر. قد يتأخر التحديث بحسب وقت فحص المصدر واكتمال النشر.</p><a href="${magazine.path}sources.json">قائمة المصادر وقواعد الرصد</a></div></details></section>`;
}

export function magazineIndexModel() {
  const featured = magazineArticles.find((a) => a.automated) ?? magazineArticles.find((a) => a.featured);
  const radar = magazineArticles.filter((a) => a.kind === "news" && a !== featured).slice(0, 3);
  return {
    title: `${magazine.name} | أخبار الذكاء الاصطناعي`, description: magazine.description,
    path: magazine.path, active: "magazine", styles, scripts,
    shareImage: "/assets/og/riyadh-tech.png", dateModified: magazineUpdatedAt,
    pageType: ["WebPage", "CollectionPage"],
    head: `<link rel="alternate" type="application/rss+xml" title="${magazine.name}" href="${magazine.path}feed.xml">`,
    schema: [periodical, editor, breadcrumbSchema(), { "@type": "ItemList", "@id": `${site.url}${magazine.path}#articles`, name: `محتوى ${magazine.name}`, numberOfItems: magazineArticles.length, itemListElement: magazineArticles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}${articlePath(a)}`, name: a.title })) }],
    mainEntity: { "@id": `${site.url}${magazine.path}#articles` },
    body: `<div class="rt-magazine"><div class="container">${crumbs()}
      <section class="rt-masthead" aria-labelledby="rt-title"><div class="rt-masthead-top"><span lang="en" dir="ltr">RIYADH TECH <i>BY BOWDY LABS</i></span><span class="rt-issue">نشرة متجددة <b>أخبار الذكاء الاصطناعي</b></span></div><h1 id="rt-title"><small>مجلة</small> رياض <em>التقنية<span aria-hidden="true">.</span></em></h1><div class="rt-masthead-bottom"><p>نقرأ تحوّلات الذكاء الاصطناعي.<br class="rt-mobile-break"> ونقرّب لك ما يصنع الفرق.</p><a href="#library">اكتشف المحتوى ${arrow}</a></div></section>
      <div class="rt-topic-strip" aria-label="اهتمامات المجلة"><span><i></i>في عالم يتغير كل يوم</span><span>نماذج الذكاء الاصطناعي</span><span>وكلاء وأتمتة</span><span>أدوات للمطورين</span><span>أبحاث وتطبيقات</span></div>
      ${automaticNotice()}<section class="rt-lead-grid" aria-label="مختارات المجلة"><article class="rt-lead"><a class="rt-lead-art" href="${articlePath(featured)}" tabindex="-1" aria-hidden="true">${art(featured, { featured: true })}<span class="rt-feature-badge">تحت المجهر</span></a><div class="rt-lead-copy"><div class="rt-card-top"><span class="rt-category">${featured.categoryLabel}</span><span>${featured.tag}</span></div><h2><a href="${articlePath(featured)}">${esc(featured.title)}</a></h2><p>${esc(featured.excerpt)}</p><div class="rt-lead-bottom">${meta(featured)}<a class="rt-link" href="${articlePath(featured)}">اقرأ الخبر ${arrow}</a></div></div></article>
      <aside class="rt-radar" aria-labelledby="rt-radar-title"><div class="rt-radar-title"><h2 id="rt-radar-title">على رادار التقنية</h2><span lang="en">THE SIGNAL</span></div>${radar.map((a, i) => `<article><span class="rt-radar-number">0${i + 1}</span><div><span class="rt-radar-tag">${esc(a.tag)}</span><h3><a href="${articlePath(a)}">${esc(a.title)}</a></h3><time datetime="${a.eventDate}">${formatDate(a.eventDate)}</time></div></article>`).join("")}<a class="rt-radar-note" href="${articlePath(magazineArticles.find(a => a.category === "business"))}"><span>من الخبر إلى التطبيق<strong>أين تبدأ شركتك مع AI؟</strong></span>${arrow}</a></aside></section>
      <section class="rt-library" id="library" aria-labelledby="rt-library-title"><div class="rt-section-head"><div><span class="rt-kicker">أخبار · شروحات · أفكار قابلة للتطبيق</span><h2 id="rt-library-title">مساحة أوسع للفهم<span>.</span></h2></div><span class="rt-library-count">${magazineArticles.length} أخبار ومقالات</span></div>
      <form class="rt-search" role="search" data-magazine-search-form hidden><label for="rt-search">ابحث في المجلة</label><div>${search}<input id="rt-search" type="search" name="q" placeholder="جرّب: Gemini، وكلاء، RAG…" autocomplete="off" maxlength="120" data-magazine-search><button type="button" data-magazine-clear>مسح البحث</button></div></form>
      <div class="rt-filters" role="group" aria-label="تصفية محتوى المجلة" data-magazine-filters hidden>${magazine.categories.map((c) => `<button type="button" data-magazine-filter="${c.id}" aria-pressed="${c.id === "all"}">${c.label}<span>${c.id === "all" ? magazineArticles.length : magazineArticles.filter(a => a.category === c.id).length}</span></button>`).join("")}</div><p class="rt-result-status" role="status" aria-live="polite" data-magazine-status></p>
      <div class="rt-grid" data-magazine-grid>${magazineArticles.map(a => card(a, { filterable: true })).join("")}</div><div class="rt-empty" data-magazine-empty hidden><strong>لم نجد موضوعًا بهذه الكلمات</strong><p>جرّب اسم النموذج أو مصطلحًا أقصر، أو ارجع إلى كل المحتوى.</p><button class="button" type="button" data-magazine-reset>عرض كل الموضوعات</button></div><noscript><p class="rt-noscript">كل الموضوعات متاحة أدناه. فعّل JavaScript لاستخدام البحث والتصفية.</p></noscript></section>
      ${sourcePanel()}${editorial()}<section class="rt-bridge"><div><span class="rt-kicker">من المعرفة إلى التجربة</span><h2>استكشف ما تبنيه باودي لابز بالذكاء الاصطناعي.</h2></div><a class="rt-link" href="/agents/">قابل وكلاء باودي ${arrow}</a></section>
    </div></div>`,
  };
}

export function magazineArticleModel(article) {
  const path = articlePath(article);
  const url = `${site.url}${path}`;
  const image = articleShareImage(article);
  const published = articlePublishedAt(article);
  const modified = articleModifiedAt(article);
  const author = article.automated ? autoEditor : editor;
  const related = magazineArticles.filter(a => a !== article).sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category)).slice(0, 3);
  const schema = {
    "@type": article.kind === "news" ? "NewsArticle" : "BlogPosting", "@id": `${url}#article`,
    headline: article.title, description: article.excerpt, inLanguage: "ar-SA", articleSection: article.categoryLabel,
    datePublished: published, dateModified: modified,
    ...(article.eventDate ? { temporalCoverage: article.eventDate } : {}),
    author: { "@id": author["@id"] }, publisher: { "@id": `${site.url}/#organization` },
    mainEntityOfPage: { "@id": `${url}#webpage` }, isPartOf: { "@id": periodicalId },
    image: { "@type": "ImageObject", url: `${site.url}${image}`, width: 1200, height: 630 },
    citation: article.sources.map(s => ({ "@type": "CreativeWork", name: s.name, url: s.url, ...(s.date ? { datePublished: s.date } : {}) })),
    articleBody: article.sections.map(s => [s.title, ...(s.paragraphs ?? []), ...(s.list ?? [])].join("\n")).join("\n\n"),
  };
  return {
    title: article.title, description: article.excerpt, path, active: "magazine", type: "article", styles, scripts, shareImage: image, dateModified: modified,
    mainEntity: { "@id": `${url}#article` }, schema: [periodical, editor, article.automated ? autoEditor : null, breadcrumbSchema(article), schema],
    head: `<meta property="article:published_time" content="${published}"><meta property="article:modified_time" content="${modified}"><meta property="article:section" content="${article.categoryLabel}"><link rel="alternate" type="application/rss+xml" title="${magazine.name}" href="${magazine.path}feed.xml">`,
    body: `<div class="rt-magazine rt-article-page"><div class="container">${crumbs(article)}<a class="rt-mini-masthead" href="${magazine.path}"><span>${magazine.name}</span><small>من باودي لابز</small></a>
      <article><header class="rt-article-head"><span class="rt-category">${article.categoryLabel}</span><h1>${esc(article.title)}</h1><p class="rt-deck">${esc(article.excerpt)}</p><div class="rt-byline"><span class="rt-author-mark" aria-hidden="true">ر</span><div><a href="${magazine.path}${article.automated ? "#news-sources" : "#editorial"}">${author.name}</a><span>نُشر في المجلة <time datetime="${published}">${formatDate(published)}</time> · ${readingMinutes(article)} د قراءة</span></div></div>${article.eventDate ? `<p class="rt-event-date">تاريخ الإعلان الأصلي: <time datetime="${article.eventDate}">${formatDate(article.eventDate)}</time></p>` : ""}</header>${article.automated ? `<p class="rt-auto-disclosure" role="note"><strong>نشر تلقائي</strong> ملخص أُعد ونُشر آليًا من مصدر رسمي، دون مراجعة بشرية قبل النشر. راجع الإعلان الأصلي للتفاصيل.</p>` : ""}
      <figure class="rt-article-visual">${art(article, { featured: true })}<figcaption>رسم توضيحي من مجلة رياض التقنية.</figcaption></figure>
      <div class="rt-reading-layout"><aside class="rt-toc"><strong>في هذا الموضوع</strong><nav aria-label="محتويات المقال">${article.sections.map((s, i) => `<a href="#section-${i + 1}"><span>0${i + 1}</span>${esc(s.title)}</a>`).join("")}<a href="#sources"><span>↗</span>${article.sources.length ? "المصادر والمراجع" : "عن هذا المقال"}</a></nav><a class="rt-toc-back" href="${magazine.path}">${arrow} كل موضوعات المجلة</a></aside>
      <div class="rt-prose"><div class="rt-takeaway"><span>الفكرة الأساسية</span><p>${esc(article.takeaway)}</p></div>${article.sections.map((s, i) => `<section id="section-${i + 1}"><h2>${esc(s.title)}</h2>${(s.paragraphs ?? []).map(p => `<p>${esc(p)}</p>`).join("")}${s.list ? `<ul>${s.list.map(l => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}</section>`).join("")}
      <section class="rt-sources" id="sources"><h2>${article.sources.length ? "المصادر والمراجع" : "عن هذا المقال"}</h2>${article.sources.length ? `<ol>${article.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} <span aria-hidden="true">↗</span></a>${s.date ? `<small>تاريخ المصدر: ${formatDate(s.date)}</small>` : ""}</li>`).join("")}</ol><p>${article.automated ? "تم جلب المصدر وإعداد الملخص آليًا في" : "تمت مراجعة الروابط والمعلومات في"} ${formatDate(published)}. ${article.kind === "news" ? "هذا تلخيص تحريري للإعلان الرسمي مع قراءة المجلة؛ وليس اختبار أداء مستقلًا." : "المقال شرح أصلي يستند إلى المرجع المذكور ويتضمن اقتراحات تطبيقية من المجلة."}</p>` : "<p>مقال أصلي من هيئة تحرير مجلة رياض التقنية. يقدم إطار عمل مقترحًا وأمثلة توضيحية، ولا يعرض نتائج دراسة أو تجربة عميل.</p>"}<a class="rt-correction" href="mailto:${site.email}?subject=${encodeURIComponent(`تصحيح مقال: ${article.title}`)}">اقترح تصحيحًا أو تحديثًا</a></section>
      <div class="rt-sharing"><strong>شارك الفكرة</strong><a href="https://wa.me/?text=${encodeURIComponent(`${article.title}\n${url}`)}" target="_blank" rel="noopener noreferrer">واتساب</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" lang="en">LinkedIn</a><button type="button" data-magazine-copy hidden>نسخ الرابط</button><span role="status" aria-live="polite" data-magazine-copy-status></span></div></div></div></article>
      <section class="rt-related" aria-labelledby="rt-related-title"><div class="rt-section-head"><div><span class="rt-kicker">واصل القراءة</span><h2 id="rt-related-title">موضوعات تكمل الصورة<span>.</span></h2></div><a class="rt-link" href="${magazine.path}">كل المجلة ${arrow}</a></div><div class="rt-grid">${related.map(a => card(a)).join("")}</div></section>
    </div></div>`,
  };
}

export function magazineFeed() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${magazine.name}</title><link>${site.url}${magazine.path}</link><description>${esc(magazine.description)}</description><language>ar-SA</language><atom:link href="${site.url}${magazine.path}feed.xml" rel="self" type="application/rss+xml"/><lastBuildDate>${new Date(magazineUpdatedAt).toUTCString()}</lastBuildDate>${magazineArticles.map(a => `<item><title>${esc(a.title)}</title><link>${site.url}${articlePath(a)}</link><guid isPermaLink="true">${site.url}${articlePath(a)}</guid><pubDate>${new Date(articlePublishedAt(a)).toUTCString()}</pubDate><description>${esc(a.excerpt)}</description><category>${a.categoryLabel}</category></item>`).join("")}</channel></rss>`;
}
