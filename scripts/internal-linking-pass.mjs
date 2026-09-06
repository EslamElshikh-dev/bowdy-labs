import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { agents } from "../src/agents.mjs";
import { insightClusters, insightGuides } from "../src/insights-engine-content.mjs";
import { wave2Guides } from "../src/insights-wave2-content.mjs";

const dist = join(process.cwd(), "dist");
const allGuides = [...insightGuides, ...wave2Guides];
const guideBySlug = new Map(allGuides.map((guide) => [guide.slug, guide]));
const clusterBySlug = new Map(insightClusters.map((cluster) => [cluster.slug, cluster]));
const agentByCode = new Map(agents.map((agent) => [agent.code, agent]));

const copy = {
  ar: {
    continueTopic: "واصل القراءة داخل نفس المحور",
    continueCopy: "أدلة مترابطة تساعدك تنتقل من الفكرة إلى قرار معماري أو تشغيلي أكثر تحديدًا.",
    agents: "وكلاء باودي المرتبطون بهذا الموضوع",
    agentsCopy: "اربط الإطار النظري بوكيل أعمال له مهمة وصلاحيات وحدود تشغيل واضحة.",
    implementation: "دراسة حالة عامة مرتبطة",
    implementationCopy: "شاهد كيف تتحول الفكرة إلى نظام أعمال مترابط دون كشف المسارات أو البيانات الداخلية.",
    caseLabel: "دراسة Alargan CRM العامة",
    commercial: "أدلة تساعدك قبل بدء المشروع",
    commercialCopy: "ابدأ من الأدلة الأقرب إلى قرار الشراء أو المعمارية ثم انتقل إلى مناقشة حالة الاستخدام.",
    knowledge: "مسارات معرفية مرتبطة بوكلاء باودي",
    knowledgeCopy: "كل مسار يربط الوكيل بمحور معرفة يشرح المعمارية والحوكمة والتشغيل قبل التنفيذ.",
    caseKnowledge: "اقرأ المعمارية خلف حالة الاستخدام",
    caseKnowledgeCopy: "روابط مختارة تشرح الوكلاء والأتمتة المرتبطة بهذا النوع من أنظمة CRM دون الادعاء أن كل تقنية مستخدمة في الحالة نفسها.",
  },
  en: {
    continueTopic: "Continue within this topic",
    continueCopy: "Related guides move from the broad idea to a more specific architecture or operating decision.",
    agents: "BOWDY Agents connected to this topic",
    agentsCopy: "Connect the framework to a business agent with a defined job, permissions and operating boundaries.",
    implementation: "Related public case study",
    implementationCopy: "See how an AI-enabled business workflow can become a connected operating system without exposing private routes or internal data.",
    caseLabel: "Public Alargan CRM case study",
    commercial: "Guides to read before starting the project",
    commercialCopy: "Start with the guides closest to the buying or architecture decision, then discuss the use case.",
    knowledge: "Knowledge paths connected to BOWDY Agents",
    knowledgeCopy: "Each path connects an agent to the architecture, governance or operating topic behind its job.",
    caseKnowledge: "Read the architecture behind the use case",
    caseKnowledgeCopy: "Selected guides explain agentic and automation patterns relevant to this type of CRM system without claiming every pattern was used in the case itself.",
  },
};

const clusterAgentCodes = {
  "ai-agents": ["B-03", "B-05", "B-07"],
  "enterprise-rag": ["B-05"],
  "arabic-ai": ["B-03"],
  "ai-governance": ["B-04"],
  "automation-saudi-arabia": ["B-01", "B-06", "B-09"],
};

const serviceGuideMap = {
  "ai-agents": ["enterprise-ai-agent-architecture", "ai-agent-use-cases-saudi-arabia", "ai-agent-cost-build-vs-buy-saudi"],
  "knowledge-bases": ["enterprise-rag-architecture", "rag-security-access-control"],
  cybersecurity: ["ai-governance-checklist", "human-in-the-loop-ai"],
  "digital-advertising": ["ai-automation-roi-measurement-saudi", "ai-workflow-automation-use-cases-saudi"],
};

const serviceAgentMap = {
  "ai-agents": ["B-03", "B-05", "B-07"],
  "knowledge-bases": ["B-05"],
  cybersecurity: ["B-04"],
  "digital-advertising": ["B-06"],
};

const agentKnowledgeMap = [
  ["B-03", "arabic-ai"],
  ["B-05", "enterprise-rag"],
  ["B-04", "ai-governance"],
  ["B-06", "automation-saudi-arabia"],
  ["B-07", "ai-agents"],
];

const route = (lang, path) => `${lang === "en" ? "/en" : ""}${path}`;
const guideRoute = (lang, slug) => route(lang, `/insights/${slug}/`);
const hubRoute = (lang, slug) => route(lang, `/insights/topics/${slug}/`);
const agentsRoute = (lang, slug) => `${route(lang, "/agents/")}#${slug}`;
const caseRoute = (lang) => route(lang, "/work/alargan-crm/");

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pageFile(lang, path) {
  const clean = path.split("/").filter(Boolean);
  return join(dist, ...(lang === "en" ? ["en"] : []), ...clean, "index.html");
}

function linksList(items) {
  return `<div class="outcome-list">${items.map(({ href, label, note }) => `<p><span aria-hidden="true">→</span><span><a class="text-link" href="${href}">${esc(label)}</a>${note ? ` — ${esc(note)}` : ""}</span></p>`).join("")}</div>`;
}

function panel({ marker, title, description, items }) {
  if (!items.length) return "";
  return `<!-- BOWDY_INTERNAL_LINKS:${marker} --><section class="section-pad internal-linking-pass" data-internal-linking="${marker}"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>BOWDY KNOWLEDGE GRAPH</span><h2>${esc(title)}</h2><p>${esc(description)}</p></div>${linksList(items)}</div></section>`;
}

function injectBeforeMainEnd(html, block, marker) {
  if (!block || html.includes(`BOWDY_INTERNAL_LINKS:${marker}`)) return html;
  if (!html.includes("</main>")) throw new Error(`Missing </main> while injecting ${marker}`);
  return html.replace("</main>", `${block}</main>`);
}

function injectBeforeFaqOrMain(html, block, marker) {
  if (!block || html.includes(`BOWDY_INTERNAL_LINKS:${marker}`)) return html;
  const faqPattern = /<section class=["']section-pad faq-section["']/;
  if (faqPattern.test(html)) return html.replace(faqPattern, `${block}<section class="section-pad faq-section"`);
  return injectBeforeMainEnd(html, block, marker);
}

function siblingGuides(guide) {
  const siblings = allGuides.filter((item) => item.cluster === guide.cluster && item.slug !== guide.slug);
  if (siblings.length <= 3) return siblings;
  const start = allGuides.filter((item) => item.cluster === guide.cluster).findIndex((item) => item.slug === guide.slug);
  return Array.from({ length: 3 }, (_, offset) => siblings[(start + offset) % siblings.length]);
}

function guideTitle(slug, lang) {
  const guide = guideBySlug.get(slug);
  if (!guide) throw new Error(`Unknown guide ${slug}`);
  return guide[lang].title;
}

async function patchGuide(guide, lang) {
  const path = pageFile(lang, ["insights", guide.slug].join("/"));
  let html = await readFile(path, "utf8");
  const c = copy[lang];
  const siblings = siblingGuides(guide).map((item) => ({
    href: guideRoute(lang, item.slug),
    label: item[lang].title,
  }));
  const mappedAgents = (clusterAgentCodes[guide.cluster] || [])
    .map((code) => agentByCode.get(code))
    .filter(Boolean)
    .map((agent) => ({
      href: agentsRoute(lang, agent.slug),
      label: `${agent.code} · ${lang === "en" ? agent.nameEn : agent.name}`,
      note: lang === "en" ? agent.roleEn : agent.role,
    }));

  const sections = [
    panel({ marker: `siblings-${guide.slug}-${lang}`, title: c.continueTopic, description: c.continueCopy, items: siblings }),
    panel({ marker: `agents-${guide.slug}-${lang}`, title: c.agents, description: c.agentsCopy, items: mappedAgents }),
  ];

  if (["ai-agents", "automation-saudi-arabia"].includes(guide.cluster)) {
    sections.push(panel({
      marker: `case-${guide.slug}-${lang}`,
      title: c.implementation,
      description: c.implementationCopy,
      items: [{ href: caseRoute(lang), label: c.caseLabel }],
    }));
  }

  const block = sections.filter(Boolean).join("");
  html = injectBeforeFaqOrMain(html, block, `guide-bundle-${guide.slug}-${lang}`);
  // The bundle marker is separate so reruns remain idempotent even when individual section markers differ.
  if (!html.includes(`BOWDY_INTERNAL_LINKS:guide-bundle-${guide.slug}-${lang}`)) {
    html = html.replace(block, `<!-- BOWDY_INTERNAL_LINKS:guide-bundle-${guide.slug}-${lang} -->${block}`);
  }

  for (const sibling of siblings) {
    if (!html.includes(`href="${sibling.href}"`)) throw new Error(`Missing sibling link ${sibling.href} in ${guide.slug} (${lang})`);
  }
  if (mappedAgents.length && !mappedAgents.some((item) => html.includes(`href="${item.href}"`))) {
    throw new Error(`Missing agent links in ${guide.slug} (${lang})`);
  }
  if (html.includes("/alarjancrm/")) throw new Error(`Private Alargan route leaked into ${guide.slug} (${lang})`);
  await writeFile(path, html, "utf8");
}

async function patchService(serviceSlug, lang) {
  const path = pageFile(lang, `services/${serviceSlug}`);
  let html = await readFile(path, "utf8");
  const c = copy[lang];
  const guides = (serviceGuideMap[serviceSlug] || []).map((slug) => ({ href: guideRoute(lang, slug), label: guideTitle(slug, lang) }));
  const serviceAgents = (serviceAgentMap[serviceSlug] || [])
    .map((code) => agentByCode.get(code))
    .filter(Boolean)
    .map((agent) => ({ href: agentsRoute(lang, agent.slug), label: `${agent.code} · ${lang === "en" ? agent.nameEn : agent.name}` }));
  const block = panel({
    marker: `service-${serviceSlug}-${lang}`,
    title: c.commercial,
    description: c.commercialCopy,
    items: [...guides, ...serviceAgents],
  });
  html = injectBeforeMainEnd(html, block, `service-${serviceSlug}-${lang}`);
  for (const item of guides) if (!html.includes(`href="${item.href}"`)) throw new Error(`Missing guide link ${item.href} in service ${serviceSlug} (${lang})`);
  if (html.includes("/alarjancrm/")) throw new Error(`Private Alargan route leaked into service ${serviceSlug} (${lang})`);
  await writeFile(path, html, "utf8");
}

async function patchAgents(lang) {
  const path = pageFile(lang, "agents");
  let html = await readFile(path, "utf8");
  const c = copy[lang];
  const items = agentKnowledgeMap.map(([code, clusterSlug]) => {
    const agent = agentByCode.get(code);
    const cluster = clusterBySlug.get(clusterSlug);
    if (!agent || !cluster) throw new Error(`Invalid agent knowledge mapping ${code} -> ${clusterSlug}`);
    return {
      href: hubRoute(lang, clusterSlug),
      label: `${agent.code} · ${lang === "en" ? agent.nameEn : agent.name} → ${cluster[lang].title}`,
    };
  });
  items.push({ href: caseRoute(lang), label: c.caseLabel });
  const block = panel({ marker: `agents-knowledge-${lang}`, title: c.knowledge, description: c.knowledgeCopy, items });
  html = injectBeforeMainEnd(html, block, `agents-knowledge-${lang}`);
  if (!items.every((item) => html.includes(`href="${item.href}"`))) throw new Error(`Missing knowledge links on agents page (${lang})`);
  if (html.includes("/alarjancrm/")) throw new Error(`Private Alargan route leaked into agents page (${lang})`);
  await writeFile(path, html, "utf8");
}

async function patchAlarganCase(lang) {
  const path = pageFile(lang, "work/alargan-crm");
  let html = await readFile(path, "utf8");
  const c = copy[lang];
  const items = [
    { href: hubRoute(lang, "ai-agents"), label: clusterBySlug.get("ai-agents")[lang].title },
    { href: guideRoute(lang, "enterprise-ai-agent-architecture"), label: guideTitle("enterprise-ai-agent-architecture", lang) },
    { href: guideRoute(lang, "whatsapp-crm-ai-automation-saudi"), label: guideTitle("whatsapp-crm-ai-automation-saudi", lang) },
  ];
  const block = panel({ marker: `alargan-case-${lang}`, title: c.caseKnowledge, description: c.caseKnowledgeCopy, items });
  html = injectBeforeMainEnd(html, block, `alargan-case-${lang}`);
  if (!items.every((item) => html.includes(`href="${item.href}"`))) throw new Error(`Missing knowledge links in Alargan case (${lang})`);
  if (html.includes("href=\"/alarjancrm/\"") || html.includes("href='/alarjancrm/'")) throw new Error(`Private Alargan route linked from public case (${lang})`);
  await writeFile(path, html, "utf8");
}

for (const guide of allGuides) {
  for (const lang of ["ar", "en"]) await patchGuide(guide, lang);
}

for (const serviceSlug of Object.keys(serviceGuideMap)) {
  for (const lang of ["ar", "en"]) await patchService(serviceSlug, lang);
}

for (const lang of ["ar", "en"]) {
  await patchAgents(lang);
  await patchAlarganCase(lang);
}

console.log(`Internal linking pass connected ${allGuides.length * 2} bilingual guide pages, ${Object.keys(serviceGuideMap).length * 2} service pages, both Agents pages and both public Alargan CRM case pages.`);
