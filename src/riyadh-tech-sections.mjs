import { site } from "./content.mjs";
import { magazine, magazineArticles, magazineUpdatedAt, articlePath, articleDate, articlePublishedAt, readingMinutes, formatDate } from "./riyadh-tech-content.mjs";
import { newsSources, lastAutomaticPublication } from "./riyadh-tech-news.mjs";
import { magazineSections, sectionPath, sourcePath, pagePath, paginateArticles, listingDefinitions, articleSourceIds, articlesForSource } from "./riyadh-tech-routing.mjs";
import { esc, magazineArrow as arrow, magazineStyles as styles, magazineScripts as scripts, magazineCard, magazineNavigation, magazineFooter, periodical, editor } from "./riyadh-tech-page.mjs";

function crumbs(items) {
  const all = [{label:"باودي لابز",path:"/"},{label:magazine.name,path:magazine.path},...items];
  return `<nav class="rt-crumbs" aria-label="مسار التنقل"><ol>${all.map((item,index)=>`<li>${index===all.length-1?`<span aria-current="page">${esc(item.label)}</span>`:`<a href="${item.path}">${esc(item.label)}</a>`}</li>`).join("")}</ol></nav>`;
}

function breadcrumbSchema(items, path) {
  return {"@type":"BreadcrumbList","@id":`${site.url}${path}#breadcrumb`,itemListElement:[{label:site.nameAr,path:"/"},{label:magazine.name,path:magazine.path},...items].map((item,index)=>({"@type":"ListItem",position:index+1,name:item.label,item:`${site.url}${item.path}`}))};
}

function pageModel({title,description,path,active,body,indexable=true,image="/assets/og/riyadh-tech.png",schema=[],items,type="CollectionPage",head=""}) {
  const breadcrumbs = items ?? [{label:title,path}];
  return {title,description,path,active:"magazine",styles,scripts,shareImage:image,dateModified:magazineUpdatedAt,indexable,
    robots:indexable?"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1":"noindex, follow",
    pageType:["WebPage",type],schema:[periodical,editor,breadcrumbSchema(breadcrumbs,path),...schema],
    head:`<link rel="alternate" type="application/rss+xml" title="${magazine.name}" href="${magazine.path}feed.xml">${head}`,
    body:`<div class="rt-magazine rt-section-page"><div class="container">${crumbs(breadcrumbs)}${magazineNavigation({active})}${body}${magazineFooter()}</div></div>`};
}

function hubHeader({title,description,kicker="RIYADH TECH",detail="",accent="#59e6c4"}) {
  return `<header class="rt-hub-header" style="--hub-accent:${accent}"><span class="rt-hub-kicker" lang="en" dir="ltr">${esc(kicker)}</span><h1>${esc(title)}<span aria-hidden="true">.</span></h1><p>${esc(description)}</p>${detail?`<div class="rt-hub-detail">${detail}</div>`:""}</header>`;
}

function pagination(base, page) {
  if (page.totalPages < 2) return "";
  const numbers = new Set([1,page.totalPages,page.page-1,page.page,page.page+1].filter(n=>n>0&&n<=page.totalPages));
  let previous=0;
  const links=[...numbers].sort((a,b)=>a-b).map(n=>{const gap=previous&&n>previous+1?'<span aria-hidden="true">…</span>':"";previous=n;return `${gap}<a href="${pagePath(base,n)}"${n===page.page?' aria-current="page"':""} aria-label="الصفحة ${n}">${n}</a>`;}).join("");
  return `<nav class="rt-pagination" aria-label="صفحات الأرشيف">${page.page>1?`<a class="rt-page-direction" href="${pagePath(base,page.page-1)}" rel="prev">السابقة</a>`:""}${links}${page.page<page.totalPages?`<a class="rt-page-direction" href="${pagePath(base,page.page+1)}" rel="next">التالية</a>`:""}<small>الصفحة ${page.page} من ${page.totalPages}</small></nav>`;
}

export function compactArticle(article,{searchable=false,saved=false}={}) {
  const path=articlePath(article);
  return `<article class="rt-result-card"${searchable?` data-magazine-card data-category="${article.category}" data-source-ids="${articleSourceIds(article).join(" ")}" data-published="${articlePublishedAt(article)}" data-search="${esc([article.title,article.excerpt,article.tag,article.visual,article.categoryLabel].join(" "))}"`:""}${saved?` data-saved-card="${path}" hidden`:""}><div><a class="rt-category" href="${sectionPath(article.category)}">${article.categoryLabel}</a><h2><a href="${path}">${esc(article.title)}</a></h2><p>${esc(article.excerpt)}</p><div class="rt-meta"><span>${article.automated?"خبر آلي":article.kind==="news"?"خبر":"مقال"}</span><span>${readingMinutes(article)} د قراءة</span><time datetime="${articleDate(article)}">${formatDate(articleDate(article))}</time></div></div>${saved?`<button type="button" class="rt-save-button" data-save-article="${path}" aria-pressed="true">إزالة من القائمة</button>`:`<a class="rt-arrow" href="${path}" aria-label="اقرأ: ${esc(article.title)}">${arrow}</a>`}</article>`;
}

function listingPage(definition, pageNumber) {
  const page=paginateArticles(definition.items,{page:pageNumber});
  const path=pagePath(definition.path,pageNumber);
  const title=`${definition.label}${pageNumber>1?` | الصفحة ${pageNumber}`:""}`;
  const source=definition.source;
  const detail=`<span>عدد الموضوعات: ${page.total}</span><span>${page.totalPages>1?`الصفحة ${pageNumber} من ${page.totalPages}`:"مرتبة من الأحدث"}</span>${source?`<a href="${source.homepage}" target="_blank" rel="noopener noreferrer">الموقع الرسمي لـ${source.name} ↗</a>`:`<a href="${magazine.path}search/">ابحث في المجلة ↗</a>`}`;
  const parents=source?[{label:"المصادر",path:`${magazine.path}sources/`}]:[];
  const breadcrumbs=[...parents,...(pageNumber>1?[{label:definition.label,path:definition.path}]:[]),{label:pageNumber>1?`الصفحة ${pageNumber}`:definition.label,path}];
  const body=hubHeader({title:definition.label,description:definition.description,kicker:definition.kicker,accent:definition.accent,detail})+
    (definition.type==="section"?`<nav class="rt-section-switcher" aria-label="أقسام المجلة">${magazineSections.map(section=>`<a href="${sectionPath(section.id)}"${section.id===definition.id?' aria-current="page"':""}>${section.label}</a>`).join("")}</nav>`:"")+
    `<section class="rt-listing" aria-label="موضوعات ${esc(definition.label)}">${page.items.length?(definition.type==="archive"?`<div class="rt-results-list">${page.items.map(article=>compactArticle(article)).join("")}</div>`:`<div class="rt-grid">${page.items.map(article=>magazineCard(article,{headingLevel:2})).join("")}</div>`):`<div class="rt-empty"><strong>المصدر جاهز للمتابعة</strong><p>لم تنشر المجلة موضوعًا يستند إلى ${esc(source?.name??definition.label)} حتى الآن. ستظهر الأخبار المؤهلة هنا بعد نشرها.</p><a class="rt-link" href="${sectionPath("news")}">تصفح أخبار الذكاء الاصطناعي ${arrow}</a></div>`}${pagination(definition.path,page)}</section>`+
    (source?`<aside class="rt-source-explainer"><h2>كيف نستخدم هذا المصدر؟</h2><p>نربط كل موضوع بالإعلان أو المرجع الأصلي، ونفصل تاريخ المصدر عن تاريخ النشر في المجلة. الملخصات الآلية موسومة بوضوح، وذكر المصدر لا يعني شراكة مع الجهة الناشرة.</p><a class="rt-link" href="${magazine.path}about/#automation">منهج التحرير والنشر ${arrow}</a></aside>`:"");
  const itemsId=`${site.url}${path}#items`;
  return pageModel({title,description:definition.description,path,active:source?"sources":definition.id,body,indexable:page.items.length>0,image:source?`/assets/og/riyadh-tech-source-${source.id}.png`:undefined,items:breadcrumbs,
    schema:[{"@type":"ItemList","@id":itemsId,name:definition.label,numberOfItems:page.total,itemListElement:page.items.map((article,index)=>({"@type":"ListItem",position:(pageNumber-1)*page.size+index+1,url:`${site.url}${articlePath(article)}`,name:article.title}))}],
    head:`${pageNumber>1?`<link rel="prev" href="${site.url}${pagePath(definition.path,pageNumber-1)}">`:""}${pageNumber<page.totalPages?`<link rel="next" href="${site.url}${pagePath(definition.path,pageNumber+1)}">`:""}`});
}

function sourcesPage() {
  const path=`${magazine.path}sources/`;
  return pageModel({title:"مصادر مجلة رياض التقنية",description:"تعرّف على المصادر الرسمية التي تتابعها مجلة رياض التقنية، وتصفح الأخبار والشروحات بحسب الجهة الناشرة، مع توضيح آلية الرصد والنشر والمراجعة.",path,active:"sources",body:
    hubHeader({title:"نعود إلى المصدر",description:"سبعة مصادر رسمية، ومسار واضح من الإعلان الأصلي إلى ملخص عربي في المجلة. اختر المصدر لتصفح موضوعاته.",kicker:"FOLLOW THE ORIGINAL",detail:`<span>${newsSources.length} مصادر</span><span>رصد كل ساعة</span>${lastAutomaticPublication?`<span>آخر نشر آلي: ${formatDate(lastAutomaticPublication)}</span>`:""}`})+
    `<section class="rt-source-directory" aria-label="المصادر الرسمية">${newsSources.map((source,index)=>`<article><span class="rt-source-monogram" aria-hidden="true">${String(index+1).padStart(2,"0")}</span><h2><a href="${sourcePath(source)}" lang="en">${source.name}</a></h2><p>${source.feed?"نرصد خلاصة الأخبار الرسمية، ثم نرجع إلى الإعلان الأصلي قبل التلخيص.":"نتابع صفحة الأخبار الرسمية، ونتحقق من الإعلان وتاريخه قبل التلخيص."}</p><span class="rt-source-total">الموضوعات في المجلة: ${articlesForSource(source).length}</span><a class="rt-link" href="${sourcePath(source)}">تصفح موضوعات المصدر ${arrow}</a><a class="rt-source-external" href="${source.homepage}" target="_blank" rel="noopener noreferrer">زيارة الموقع الرسمي ↗</a></article>`).join("")}</section><section class="rt-source-explainer"><h2>ماذا يعني «نشر تلقائي»؟</h2><p>تُفحص المصادر كل ساعة، وتُنشر الملخصات المؤهلة مع إظهار المصدر والتاريخ، دون مراجعة بشرية قبل النشر. عند عدم التأكد من الخبر أو تاريخه، لا يُضاف إلى المجلة.</p><a class="rt-link" href="${magazine.path}about/#automation">اقرأ منهج المجلة ${arrow}</a></section>`});
}

function searchPage() {
  const path=`${magazine.path}search/`;
  return pageModel({title:"البحث في مجلة رياض التقنية",description:"ابحث في أخبار ومقالات مجلة رياض التقنية بحسب اسم النموذج أو الفكرة أو الجهة الناشرة، مع تصفية الأقسام وترتيب النتائج للوصول إلى الموضوع المناسب.",path,active:"search",indexable:false,type:"SearchResultsPage",body:
    hubHeader({title:"ماذا تريد أن تفهم اليوم؟",description:"ابحث باسم نموذج، أو تقنية، أو سؤال. ويمكنك تضييق النتائج بحسب القسم والمصدر.",kicker:"FIND YOUR NEXT READ",detail:`<span>${magazineArticles.length} أخبار ومقالات قابلة للبحث</span>`})+
    `<section class="rt-search-page" aria-label="البحث الشامل"><form class="rt-search" role="search" data-magazine-search-form hidden><label for="rt-search">كلمة البحث</label><div><input id="rt-search" type="search" name="q" placeholder="مثلًا: Gemini، الوكلاء، RAG…" autocomplete="off" maxlength="120" data-magazine-search><button type="button" data-magazine-clear>مسح البحث</button></div></form><div class="rt-search-options" data-search-options hidden><label>المصدر<select data-magazine-source><option value="all">كل المصادر</option>${newsSources.map(source=>`<option value="${source.id}">${source.name}</option>`).join("")}</select></label><label>ترتيب النتائج<select data-magazine-sort><option value="latest">الأحدث نشرًا</option><option value="oldest">الأقدم نشرًا</option></select></label></div><div class="rt-filters" role="group" aria-label="تصفية بحسب القسم" data-magazine-filters hidden>${magazine.categories.map(category=>`<button type="button" data-magazine-filter="${category.id}" aria-pressed="${category.id==="all"}">${category.label}<span>${category.id==="all"?magazineArticles.length:magazineArticles.filter(a=>a.category===category.id).length}</span></button>`).join("")}</div><p class="rt-result-status" role="status" aria-live="polite" data-magazine-status></p><div class="rt-results-list" data-magazine-grid>${magazineArticles.map(article=>compactArticle(article,{searchable:true})).join("")}</div><div class="rt-empty" data-magazine-empty hidden><strong>لا توجد نتائج بهذه الاختيارات</strong><p>جرّب كلمة أقصر أو أزل تصفية المصدر والقسم.</p><button class="button" type="button" data-magazine-reset>إعادة ضبط البحث</button></div><button class="rt-load-more" type="button" data-search-more hidden>عرض نتائج أكثر</button><noscript><p class="rt-noscript">كل الموضوعات ظاهرة هنا. فعّل JavaScript للبحث والتصفية.</p></noscript></section>`});
}

function savedPage() {
  return pageModel({title:"قائمة القراءة | مجلة رياض التقنية",description:"احتفظ بالموضوعات التي تريد العودة إليها داخل مجلة رياض التقنية. قائمة القراءة محفوظة في متصفحك على هذا الجهاز، ويمكنك إضافة المقال أو إزالته من صفحة القراءة.",path:`${magazine.path}saved/`,active:"saved",indexable:false,body:
    hubHeader({title:"قراءتك القادمة، في مكان واحد",description:"احفظ موضوعًا من صفحة المقال، وارجع إليه عندما يناسبك. تُحفظ القائمة في متصفحك على هذا الجهاز، دون الحاجة إلى حساب.",kicker:"YOUR READING LIST"})+
    `<section class="rt-saved-page" data-saved-page><div class="rt-saved-toolbar"><p role="status" aria-live="polite" data-saved-status></p><button type="button" data-clear-saved hidden>إفراغ القائمة</button></div><div class="rt-empty" data-saved-empty><strong>ابدأ بموضوع يستحق العودة إليه</strong><p data-saved-empty-message>افتح أي مقال واضغط «احفظ للقراءة لاحقًا» لإضافته هنا.</p><a class="rt-link" href="${magazine.path}archive/">اكتشف موضوعات المجلة ${arrow}</a></div><div class="rt-results-list">${magazineArticles.map(article=>compactArticle(article,{saved:true})).join("")}</div><noscript><p class="rt-noscript">تحتاج إلى تفعيل JavaScript لعرض قائمة القراءة المحفوظة في هذا المتصفح.</p></noscript></section>`});
}

function aboutPage() {
  return pageModel({title:"عن المجلة ومنهج التحرير",description:"تعرّف على مجلة رياض التقنية من باودي لابز: نطاق التغطية، اختيار المصادر، تمييز الملخصات الآلية، وطريقة إرسال التصحيحات أو اقتراح تحديث للمعلومات.",path:`${magazine.path}about/`,active:"about",type:"AboutPage",body:
    hubHeader({title:"معرفة أوضح، وقراءة لها مصدر",description:"مجلة رياض التقنية قسم معرفي من باودي لابز، يجمع أخبار الذكاء الاصطناعي وشروحه وأفكاره العملية للقارئ العربي.",kicker:"ABOUT RIYADH TECH"})+
    `<div class="rt-about-layout"><aside class="rt-toc"><strong>منهج المجلة</strong><nav aria-label="أقسام منهج التحرير"><a href="#editorial">ما الذي ننشره؟</a><a href="#sources-policy">اختيار المصادر</a><a href="#automation">النشر التلقائي</a><a href="#corrections">التصحيح والتحديث</a></nav></aside><div class="rt-prose"><section id="editorial"><h2>ما الذي ننشره؟</h2><p>نتابع تطورات النماذج والأدوات والوكلاء والأبحاث والتطبيقات الفعلية للذكاء الاصطناعي. وننشر شروحات وأدلة قرار تساعد على فهم التقنية واختيار تجربة مناسبة في بيئة العمل.</p><p>الأخبار تلخص إعلانًا منشورًا وتربطه بمصدره. أما الشروحات فتقدم تفسيرًا وأمثلة ومقترحات تطبيقية، وتوضح حدود ما نعرفه بدل تحويل ادعاءات الشركات إلى نتائج مؤكدة من المجلة.</p></section><section id="sources-policy"><h2>نبدأ من الإعلان الأصلي</h2><p>نستخدم الصفحات والخلاصات الرسمية، ونتحقق من تاريخ الإعلان وصلته بالذكاء الاصطناعي. نعرض المصدر داخل كل موضوع، ونفصل تاريخ الحدث عن تاريخ نشر الملخص في المجلة.</p><p>ذكر جهة أو منتج لا يعني شراكة أو اعتمادًا رسميًا. نتائج الاختبارات التي تذكرها جهة مطورة تُنسب إليها، ولا تُعرض بوصفها اختبارًا مستقلًا أجرته المجلة.</p><a class="rt-link" href="${magazine.path}sources/">استكشف المصادر ${arrow}</a></section><section id="automation"><h2>النشر التلقائي، بوضوح</h2><p>تراجع مهمة دورية المصادر كل ساعة وتضيف الأخبار الجديدة المؤهلة. تُنشر الملخصات الآلية دون مراجعة بشرية مسبقة، ويظهر ذلك بوسم واضح واسم «الرصد الآلي لمجلة رياض التقنية».</p><ul><li>لا نضيف الخبر عندما يتعذر التحقق من المصدر أو تاريخ الإعلان.</li><li>نمنع تكرار الرابط نفسه، ونراجع تشابه الحدث قبل إضافة خبر جديد.</li><li>نلخص المحتوى بالعربية ونربطه بالأصل بدل إعادة نشر المقال كاملًا.</li><li>قد يتأخر ظهور الخبر بحسب دورة الرصد واكتمال النشر.</li></ul></section><section id="corrections"><h2>المعلومة قابلة للتصحيح</h2><p>إذا وجدت خطأً أو تحديثًا مهمًا، أرسل رابط الموضوع والنقطة التي تحتاج إلى تعديل مع مرجعها. رابط «اقترح تصحيحًا أو تحديثًا» متاح داخل المقالات أيضًا.</p><a class="rt-link" href="mailto:${site.email}?subject=${encodeURIComponent("تصحيح في مجلة رياض التقنية")}">راسل المجلة ${arrow}</a></section></div></div>`});
}

export function magazineExtraPageModels() {
  const pages=[];
  for (const definition of listingDefinitions()) {
    const {totalPages}=paginateArticles(definition.items);
    for(let page=1;page<=totalPages;page++)pages.push(listingPage(definition,page));
  }
  pages.push(sourcesPage(),searchPage(),savedPage(),aboutPage());
  return pages;
}
