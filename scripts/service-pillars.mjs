import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

const pillars = `<section class="service-pillars section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>THREE CORE SYSTEMS</span><h2>ثلاثة مسارات رئيسية. وكل خدمة تحتها لها مكان واضح.</h2><p>بدل قائمة خدمات متفرقة، نجمع قدرات باودي في ثلاث منظومات: ذكاء وأتمتة، منتجات رقمية آمنة، ونمو مرتبط بمنظومة Google والبحث.</p></div><div class="service-pillar-grid"><article class="service-pillar-card reveal" style="--pillar-accent:#24d8ff"><small>01 · AI & AUTOMATION</small><h3>الذكاء الاصطناعي والأتمتة</h3><p>وكلاء أعمال، منصات RAG، مساعدين عرب، وربط النماذج بسير العمل والأنظمة الفعلية.</p><ul><li>AI Agents</li><li>RAG & Knowledge</li><li>Workflow Automation</li></ul><a class="text-link" href="/agents/">قابل فريق الوكلاء <span aria-hidden="true">↗</span></a></article><article class="service-pillar-card reveal" style="--pillar-accent:#31e6b5"><small>02 · SECURE DIGITAL PRODUCTS</small><h3>المنتجات الرقمية الآمنة</h3><p>مواقع وتطبيقات وأنظمة سحابية وERP وأمن سيبراني ضمن بنية واحدة قابلة للتشغيل والتوسع.</p><ul><li>Web & Apps</li><li>Cloud & ERP</li><li>Cybersecurity</li></ul><a class="text-link" href="/services/web-development/">استكشف المنتجات الرقمية <span aria-hidden="true">↗</span></a></article><article class="service-pillar-card reveal" style="--pillar-accent:#8b5cff"><small>03 · GROWTH & GOOGLE</small><h3>النمو ومنظومة Google</h3><p>SEO محلي وتقني، ملفات Google التجارية، إعلانات مدفوعة وقياس تحويلات يربط الظهور بالعميل الحقيقي.</p><ul><li>SEO & Local Search</li><li>Google Business Profile</li><li>Google Ads & Measurement</li></ul><a class="text-link" href="/services/seo/">استكشف مسار النمو <span aria-hidden="true">↗</span></a></article></div></div></section>`;

function ensureStyles(html) {
  if (html.includes('/assets/css/positioning.css')) return html;
  return html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/positioning.css">\n</head>');
}

let home = await readFile(join(dist, "index.html"), "utf8");
home = ensureStyles(home);
if (!home.includes('THREE CORE SYSTEMS')) {
  home = home.replace('<section class="section-pad services-section" id="services">', `${pillars}<section class="section-pad services-section" id="services">`);
}
home = home
  .replace('خدماتنا", "نظام خبرات حول هدف واحد', 'خدماتنا", "القدرات التنفيذية داخل المسارات الثلاثة')
  .replace('الخدمات التقنية الحيوية الشاملة', 'قدرات التنفيذ والتشغيل والنمو');
await writeFile(join(dist, "index.html"), home, "utf8");

let services = await readFile(join(dist, "services", "index.html"), "utf8");
services = ensureStyles(services);
if (!services.includes('THREE CORE SYSTEMS')) {
  const marker = '<section class="section-pad ai-services-section" id="ai-services">';
  services = services.replace(marker, `${pillars}${marker}`);
}
services = services
  .replace('خدمات ذكاء اصطناعي وتقنية <span>تبني ميزة تنافسية</span> قابلة للقياس', 'ثلاث منظومات تقنية <span>تعمل كفريق واحد</span> حول هدفك')
  .replace('الخدمات التقنية الحيوية الشاملة', 'قدرات المنتجات والتشغيل والنمو');
await writeFile(join(dist, "services", "index.html"), services, "utf8");

console.log('Applied three-pillar service architecture to homepage and services page.');
