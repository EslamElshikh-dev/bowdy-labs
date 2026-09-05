import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { services, site } from "../src/content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const buildDate = new Date().toISOString().slice(0, 10);

const groups = {
  "الأمن والبنية السحابية": "Security & Cloud",
  "الذكاء الاصطناعي والبرمجيات": "AI & Software",
  "منظومة Google": "Google Ecosystem",
  "النمو والبحث الذكي": "Growth & Intelligent Search",
};

const routePairs = [
  { key: "services", en: "/en/services/", ar: "/services/", title: "AI, Software & Digital Services in Saudi Arabia", description: "Explore BOWDY LABS capabilities across AI agents, secure digital products, cybersecurity, cloud, Google, local search and measurable digital growth." },
  { key: "work", en: "/en/work/", ar: "/work/", title: "Selected Work & Digital Case Studies", description: "Selected BOWDY LABS work across web platforms, local search, conversion UX and agent-led enterprise experiences." },
  { key: "about", en: "/en/about/", ar: "/about/", title: "About BOWDY LABS", description: "BOWDY LABS is a Riyadh technology lab building secure AI, software and digital growth systems around measurable business outcomes." },
  { key: "contact", en: "/en/contact/", ar: "/contact/", title: "Contact BOWDY LABS", description: "Discuss an AI, software, cybersecurity, cloud, Google or digital growth project with BOWDY LABS in Riyadh, Saudi Arabia." },
  { key: "insights", en: "/en/insights/", ar: "/insights/", title: "BOWDY LABS Insights", description: "Practical BOWDY LABS perspectives on AI agents, secure digital products, search-ready websites and technology decisions." },
];

const workCases = [
  {
    title: "Tawod General Contracting",
    category: "Contracting · Riyadh",
    summary: "An Arabic-first company platform connecting service architecture, local search and direct-response conversion paths in one scalable web system.",
    tags: ["Web Development", "Technical SEO", "Local SEO"],
    url: "https://tawodco.com/",
    action: "View live project",
  },
  {
    title: "Ameen Maintenance Services",
    category: "Home Services · Riyadh",
    summary: "A fast mobile-first landing experience built around local intent, clear service messaging and short paths from search to call or WhatsApp.",
    tags: ["Landing Page", "Conversion UX", "Local Search"],
    url: "https://ameenservse.vercel.app/",
    action: "View live project",
  },
  {
    title: "Alargan CRM — Agent-Led Proposal",
    category: "Real Estate CRM · Enterprise UX",
    summary: "A client-safe public case summary showing how a complex CRM proposal was reframed as an agent-led experience that explains the system, integrations and business value step by step.",
    tags: ["AI UX", "CRM", "Interactive Proposal"],
    url: null,
    action: null,
  },
];

const insights = [
  {
    title: "How to start an AI agent inside your company without creating unnecessary risk",
    category: "Artificial Intelligence",
    copy: "Start from one measurable job, trusted data, explicit permissions and a realistic evaluation set before moving from prototype to production.",
  },
  {
    title: "Secure digital products: decisions that should happen before code",
    category: "Secure Engineering",
    copy: "Trust boundaries, secrets, recovery, access and user experience should be designed as one operating system rather than patched in after launch.",
  },
  {
    title: "Building a website ready for search and AI systems",
    category: "Web & SEO",
    copy: "Clear information architecture, performance, structured data and useful content make a site easier for people, search engines and intelligent systems to understand.",
  },
];

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const pairedAlternates = (en, ar) => `<link rel="alternate" hreflang="ar" href="${site.url}${ar}"><link rel="alternate" hreflang="ar-SA" href="${site.url}${ar}"><link rel="alternate" hreflang="en" href="${site.url}${en}"><link rel="alternate" hreflang="x-default" href="${site.url}${ar}">`;

function ensurePositioningStyles(html) {
  if (html.includes('/assets/css/positioning.css')) return html;
  return html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/positioning.css">\n</head>');
}

function rewriteEnglishLinks(html) {
  return html
    .replace(/href="\/services\/([^"#?]+)\/"/g, 'href="/en/services/#$1"')
    .replaceAll('href="/services/"', 'href="/en/services/"')
    .replaceAll('href="/work/"', 'href="/en/work/"')
    .replaceAll('href="/about/"', 'href="/en/about/"')
    .replaceAll('href="/insights/"', 'href="/en/insights/"')
    .replace(/href="\/contact\/([^\"]*)"/g, 'href="/en/contact/$1"');
}

function setLanguageTarget(html, target) {
  return html.replace(/(<a class="language-link" href=")[^"]*("[^>]*>)/g, `$1${target}$2`);
}

function setActiveNavigation(html, activePath) {
  for (const className of ["desktop-nav", "mobile-menu"]) {
    const pattern = new RegExp(`(<nav class="${className}"[\\s\\S]*?<\\/nav>)`);
    html = html.replace(pattern, (nav) => {
      const clean = nav.replace(/ aria-current="page"/g, "");
      return clean.replace(`href="${activePath}"`, `href="${activePath}" aria-current="page"`);
    });
  }
  return html;
}

function replaceAlternates(html, en, ar) {
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, "");
  return html.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n  ${pairedAlternates(en, ar)}`);
}

function schemaFor(page) {
  const pageUrl = `${site.url}${page.en}`;
  const graph = [
    {
      "@type": page.key === "contact" ? "ContactPage" : page.key === "about" ? "AboutPage" : "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `${page.title} | ${site.nameEn}`,
      description: page.description,
      inLanguage: "en",
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": `${site.url}/#organization` },
      dateModified: buildDate,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en/` },
        { "@type": "ListItem", position: 2, name: page.title.replace(/ in Saudi Arabia$/, ""), item: pageUrl },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.nameEn,
      alternateName: site.nameAr,
      url: site.url,
      logo: `${site.url}${site.logo}`,
      email: site.email,
      telephone: site.phone,
      address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.nameEn,
      inLanguage: ["ar-SA", "en"],
      publisher: { "@id": `${site.url}/#organization` },
    },
  ];

  if (page.key === "services") {
    graph.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#services`,
      name: "BOWDY LABS capabilities",
      numberOfItems: services.length,
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: service.titleEn,
        url: `${pageUrl}#${service.slug}`,
      })),
    });
  }

  if (page.key === "work") {
    graph.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#work`,
      name: "Selected BOWDY LABS work",
      numberOfItems: workCases.length,
      itemListElement: workCases.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
      })),
    });
  }

  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script>`;
}

function metadata(html, page) {
  const canonical = `${site.url}${page.en}`;
  const fullTitle = `${page.title} | ${site.nameEn}`;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(page.description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(fullTitle)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(page.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(fullTitle)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(page.description)}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, schemaFor(page));
  return replaceAlternates(html, page.en, page.ar);
}

const hero = (kicker, title, description, actions = "") => `<section class="page-hero section-pad"><div class="container page-hero-grid"><div class="reveal"><span class="eyebrow"><i aria-hidden="true"></i>${kicker}</span><h1>${title}</h1><p>${description}</p>${actions}</div><div class="page-hero-symbol reveal" aria-hidden="true"><span></span><img class="page-hero-logo" src="${site.logo}" width="72" height="72" alt=""></div></div></section>`;

const cta = (title = "Build what matters next", copy = "Share the outcome you need, the current state and the target timeline. We will propose a focused starting point.") => `<section class="cta-section section-pad"><div class="container cta-panel reveal"><div><span class="eyebrow"><i aria-hidden="true"></i>START WITH THE OUTCOME</span><h2>${title}</h2><p>${copy}</p></div><a class="button" href="/en/contact/">Discuss your project <span aria-hidden="true">↗</span></a></div></section>`;

function servicesMain() {
  const pillars = `<section class="service-pillars section-pad"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>THREE CORE SYSTEMS</span><h2>Three core systems. Every capability has a clear role.</h2><p>Instead of presenting disconnected services, BOWDY LABS groups delivery into AI & Automation, Secure Digital Products, and Growth & Google.</p></div><div class="service-pillar-grid"><article class="service-pillar-card reveal" style="--pillar-accent:#24d8ff"><small>01 · AI & AUTOMATION</small><h3>AI & Automation</h3><p>Business agents, RAG, Arabic customer experiences and workflow automation connected to real operating systems.</p><ul><li>AI Agents</li><li>RAG & Knowledge</li><li>Workflow Automation</li></ul><a class="text-link" href="/en/agents/">Meet the agent lineup ↗</a></article><article class="service-pillar-card reveal" style="--pillar-accent:#31e6b5"><small>02 · SECURE DIGITAL PRODUCTS</small><h3>Secure Digital Products</h3><p>Web products, applications, cloud foundations and cybersecurity designed as one maintainable operating system.</p><ul><li>Web & Apps</li><li>Cloud Systems</li><li>Cybersecurity</li></ul><a class="text-link" href="#web-development">Explore product capabilities ↓</a></article><article class="service-pillar-card reveal" style="--pillar-accent:#8b5cff"><small>03 · GROWTH & GOOGLE</small><h3>Growth & Google</h3><p>Search, Google Business Profile, advertising and measurement connected to qualified demand rather than vanity metrics.</p><ul><li>SEO & Local Search</li><li>Google Business Profile</li><li>Ads & Measurement</li></ul><a class="text-link" href="#seo">Explore growth capabilities ↓</a></article></div></div></section>`;
  const cards = services.map((service) => `<article class="service-card reveal" id="${service.slug}" data-service-group="${esc(service.group)}"><div class="service-top"><span>${service.number}</span></div><small>${groups[service.group] || "Technology"}</small><h3>${esc(service.titleEn)}</h3><p>${esc(service.shortEn)}</p><a class="text-link" href="/en/contact/?service=${service.slug}">Discuss this capability ↗</a></article>`).join("");
  return `${hero("CAPABILITIES", "AI, software and growth systems built around the business outcome", "We start with the job, users, data, risk and success criteria — then select the right technology and delivery path.", '<div class="hero-actions"><a class="button" href="/en/contact/">Discuss your project ↗</a><a class="button button-ghost" href="/en/agents/">Explore AI Agents</a></div>')}${pillars}<section class="section-pad services-section"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>DELIVERY CAPABILITIES</span><h2>Capabilities inside the three systems</h2><p>Choose one focused capability or combine several when the business outcome crosses product, security, AI and growth.</p></div><div class="services-grid" data-services-grid>${cards}</div></div></section>${cta()}`;
}

function workMain() {
  const cards = workCases.map((item) => `<article class="case-study-card reveal"><small>${item.category}</small><h3>${item.title}</h3><p>${item.summary}</p><div class="case-study-tags">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>${item.url ? `<a class="text-link" href="${item.url}" target="_blank" rel="noopener">${item.action} ↗</a>` : `<span class="case-note">Public summary only — private client routes and materials are not exposed.</span>`}</article>`).join("");
  return `${hero("SELECTED WORK", "Work that connects experience, engineering and discoverability", "Public examples and client-safe summaries showing the problem, the system built around it and the decisions that made the experience clearer.")}<section class="section-pad"><div class="container"><div class="case-study-grid">${cards}</div></div></section><section class="section-pad outcome-section"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>BEYOND THE INTERFACE</span><h2>What we review in every project</h2></div><div class="values-grid"><article class="reveal"><span>UX</span><h3>User journey</h3><p>Service clarity, trust and the shortest useful path to a decision on every device.</p></article><article class="reveal"><span>SEO</span><h3>Discoverability</h3><p>Indexability, structured data, performance and content architecture designed together.</p></article><article class="reveal"><span>SEC</span><h3>Secure foundation</h3><p>Access, secrets, deployment boundaries and risk reduction before scale increases complexity.</p></article></div></div></section>${cta("Have a similar challenge?", "Tell us what is not working today and what a useful outcome would look like. We will map the smallest credible next step.")}`;
}

function aboutMain() {
  return `${hero("ABOUT THE LAB", "We turn technical complexity into clear decisions and operating systems", "BOWDY LABS is a Riyadh technology lab connecting AI, software, security, cloud, Google and digital growth within one reviewable delivery model.")}<section class="section-pad about-story"><div class="container about-grid"><div class="about-copy reveal"><span class="eyebrow"><i aria-hidden="true"></i>WHY BOWDY LABS</span><h2>A solutions lab, not a tool reseller</h2><p>LABS describes how we work: understand the problem, test the assumption at the lowest sensible cost, then build what proves useful. Technology is selected because it serves the user and business outcome — not because it is fashionable.</p><p>We connect technical decisions to operations. Experience does not sit apart from content; content does not sit apart from search; AI does not sit apart from data quality and permissions; cloud architecture does not sit apart from security, recovery and cost.</p><p>Our operating model is secure by design and human-governed. For AI work, sensitive decisions keep explicit approval paths. For Arabic products, language, RTL behavior and local user expectations are treated as product requirements rather than translation afterthoughts.</p><p>From Riyadh, we work with businesses in Saudi Arabia and beyond through clear scope, short reviewable stages and documentation that helps teams understand what was built, how it operates and what should happen next.</p></div><div class="mission-card reveal"><span><img class="mission-logo" src="${site.logo}" width="72" height="72" alt=""></span><small>OUR NORTH STAR</small><h2>${site.taglineEn}</h2><p>Intelligence that understands the context. Innovation that earns its place. Impact that can be reviewed.</p></div></div></section><section class="section-pad values-section"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>OPERATING VALUES</span><h2>Three principles behind every decision</h2></div><div class="values-grid"><article class="reveal"><span>01</span><h3>Intelligence</h3><p>Understand context, users, data and risk before choosing the technology.</p></article><article class="reveal"><span>02</span><h3>Innovation</h3><p>Use new approaches when they improve the result, reduce waste or unlock a useful capability.</p></article><article class="reveal"><span>03</span><h3>Impact</h3><p>Define acceptance criteria and connect delivery to an operational or commercial outcome.</p></article></div></div></section><section class="section-pad operating-standards-section"><div class="container"><div class="section-head reveal"><span class="eyebrow"><i aria-hidden="true"></i>WHAT TO EXPECT</span><h2>Clear decisions from discovery to launch</h2></div><div class="standards-grid"><article class="reveal"><h3>Diagnose before prescribing</h3><p>Find the root cause and dependencies before proposing a platform or redesign.</p></article><article class="reveal"><h3>Reviewable scope</h3><p>Define deliverables, acceptance criteria and what requires a new decision.</p></article><article class="reveal"><h3>Security and responsibility</h3><p>Minimize access and data, document sensitive decisions and keep high-risk actions controlled.</p></article><article class="reveal"><h3>Measure and improve</h3><p>Separate early signals from outcomes that require time, volume and reliable data.</p></article></div></div></section>${cta()}`;
}

function contactMain() {
  const options = services.map((service) => `<option value="${service.slug}">${esc(service.titleEn)}</option>`).join("");
  return `${hero("CONTACT", "Start with the outcome, not the tool", "Share the business goal, current state and the constraint that matters most. We will use that context to recommend a focused starting point.")}<section class="section-pad contact-section"><div class="container contact-grid"><div class="contact-options reveal"><span class="eyebrow"><i aria-hidden="true"></i>DIRECT CHANNELS</span><h2>Talk to BOWDY LABS</h2><p>For the fastest project discussion, send a concise brief through WhatsApp. You can also call or email the team in Riyadh.</p><div class="contact-option-list"><a href="${site.whatsapp}" target="_blank" rel="noopener"><strong>WhatsApp</strong><span>Project discussion and follow-up</span></a><a href="tel:${site.phone}"><strong>${site.phoneDisplay}</strong><span>Call BOWDY LABS</span></a><a href="mailto:${site.email}"><strong>${site.email}</strong><span>Email</span></a><div><strong>Riyadh, Saudi Arabia</strong><span>Digital delivery in Saudi Arabia and beyond</span></div></div><div class="article-note"><p>Never send passwords, verification codes, API keys or unrestricted credentials through this form or WhatsApp.</p></div></div><form class="contact-form reveal" data-contact-form-en><div class="field"><label for="en-name">Name or company</label><input id="en-name" name="name" autocomplete="name" required></div><div class="field"><label for="en-service">Capability</label><select id="en-service" name="service" required><option value="">Select a capability</option>${options}</select></div><div class="field"><label for="en-budget">Approximate budget</label><select id="en-budget" name="budget" required><option value="">Select a range</option><option value="Under SAR 10k">Under SAR 10k</option><option value="SAR 10k–30k">SAR 10k–30k</option><option value="SAR 30k–100k">SAR 30k–100k</option><option value="Above SAR 100k">Above SAR 100k</option></select></div><div class="field field-full"><label for="en-goal">Goal and current state</label><textarea id="en-goal" name="goal" rows="6" required placeholder="What are you trying to achieve, what exists today, and what is blocking progress?"></textarea></div><div class="field-full"><button class="button" type="submit">Review brief in WhatsApp ↗</button><p class="form-status" role="status" aria-live="polite"></p></div></form></div></section><script src="/assets/js/contact-en.js" defer></script>`;
}

function insightsMain() {
  const cards = insights.map((item) => `<article class="insight-card reveal"><small>${item.category}</small><h3>${item.title}</h3><p>${item.copy}</p><a class="text-link" href="/en/contact/">Discuss this topic ↗</a></article>`).join("");
  return `${hero("INSIGHTS", "Practical thinking before the technology decision", "Short English summaries of the principles BOWDY LABS uses when evaluating AI, secure products and search-ready digital systems.")}<section class="section-pad"><div class="container insights-grid insights-grid-page">${cards}</div></section>${cta("Need a deeper technical discussion?", "Bring the use case, constraints and current architecture. We can turn the topic into a concrete decision framework for your project.")}`;
}

const pageMain = { services: servicesMain, work: workMain, about: aboutMain, contact: contactMain, insights: insightsMain };

let shell = await readFile(join(dist, "en", "index.html"), "utf8");
shell = ensurePositioningStyles(rewriteEnglishLinks(shell));
shell = setLanguageTarget(shell, "/");
shell = setActiveNavigation(shell, "/en/");
await writeFile(join(dist, "en", "index.html"), shell, "utf8");

const agentsPath = join(dist, "en", "agents", "index.html");
let agentsHtml = await readFile(agentsPath, "utf8");
agentsHtml = ensurePositioningStyles(rewriteEnglishLinks(agentsHtml));
agentsHtml = setLanguageTarget(agentsHtml, "/agents/");
agentsHtml = setActiveNavigation(agentsHtml, "/en/agents/");
await writeFile(agentsPath, agentsHtml, "utf8");

for (const page of routePairs) {
  let html = shell;
  html = metadata(html, page);
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${pageMain[page.key]()}</main>`);
  html = setLanguageTarget(html, page.ar);
  html = setActiveNavigation(html, page.en);
  const destination = join(dist, ...page.en.split("/").filter(Boolean), "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html, "utf8");

  const arabicPath = join(dist, ...page.ar.split("/").filter(Boolean), "index.html");
  let arabic = await readFile(arabicPath, "utf8");
  arabic = replaceAlternates(arabic, page.en, page.ar);
  arabic = arabic.replace(/(<a class="language-link" href=")[^"]*("[^>]*>)/g, `$1${page.en}$2`);
  await writeFile(arabicPath, arabic, "utf8");
}

const arabicAgentsPath = join(dist, "agents", "index.html");
let arabicAgents = await readFile(arabicAgentsPath, "utf8");
arabicAgents = arabicAgents.replace(/(<a class="language-link" href=")[^"]*("[^>]*>)/g, '$1/en/agents/$2');
await writeFile(arabicAgentsPath, arabicAgents, "utf8");

let sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
for (const page of routePairs) {
  const escaped = `${site.url}${page.en}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  sitemap = sitemap.replace(new RegExp(`\\s*<url><loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, "g"), "");
}
const entries = routePairs.map((page) => `  <url><loc>${site.url}${page.en}</loc><lastmod>${buildDate}</lastmod><changefreq>monthly</changefreq><priority>${page.key === "services" ? "0.9" : "0.7"}</priority></url>`).join("\n");
sitemap = sitemap.replace("</urlset>", `${entries}\n</urlset>`);
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");

for (const page of routePairs) {
  const output = await readFile(join(dist, ...page.en.split("/").filter(Boolean), "index.html"), "utf8");
  if (!output.includes(`<link rel="canonical" href="${site.url}${page.en}">`)) throw new Error(`Canonical missing for ${page.en}`);
  if (!output.includes(`hreflang="en" href="${site.url}${page.en}"`)) throw new Error(`English hreflang missing for ${page.en}`);
  if (!output.includes(`hreflang="ar-SA" href="${site.url}${page.ar}"`)) throw new Error(`Arabic hreflang missing for ${page.en}`);
  if (output.includes('href="/services/">Services</a>') || output.includes('href="/work/">Work</a>') || output.includes('href="/about/">About</a>')) throw new Error(`Arabic navigation leak remains in ${page.en}`);
}

console.log(`Built reciprocal English architecture for ${routePairs.length} routes and rewired English navigation.`);
