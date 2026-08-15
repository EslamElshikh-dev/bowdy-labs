import { agents } from './agents.mjs';
import { site } from './content.mjs';

const pick = (english, arabic, englishText) => (english ? englishText : arabic);
const imagePath = (agent, size) => `/assets/media/agents/${agent.slug}-${size}.webp`;

function agentProfile(agent, index, english) {
  const tasks = english ? agent.tasksEn : agent.tasks;
  const name = english ? agent.nameEn : agent.name;
  const role = english ? agent.roleEn : agent.role;
  const category = english ? agent.categoryEn : agent.category;
  const quote = english ? agent.quoteEn : agent.quote;
  const scenario = english ? agent.scenarioEn : agent.scenario;
  const impact = english ? agent.impactEn : agent.impact;
  const note = english ? agent.noteEn : agent.note;
  const direction = english ? 'ltr' : 'rtl';
  const imageAlt = english
    ? `${name}, the ${role} from BOWDY LABS`
    : `${name}، ${role} من باودي لابز`;

  return `<article class='agent-profile reveal${index % 2 ? ' agent-profile-reverse' : ''}' id='${agent.slug}' style='--agent-accent:${agent.accent}'>
    <div class='agent-portrait-card' data-tilt-card>
      <span class='agent-issue' lang='en' dir='ltr'>ISSUE ${String(index + 1).padStart(2, '0')}</span>
      <span class='agent-portrait-grid' aria-hidden='true'></span>
      <picture>
        <source media='(max-width:640px)' srcset='${imagePath(agent, 520)}'>
        <img src='${imagePath(agent, 900)}' width='900' height='900' loading='lazy' decoding='async' alt='${imageAlt}'>
      </picture>
      <div class='agent-portrait-label'><small>${agent.code}</small><strong lang='${english ? 'en' : 'ar'}' dir='${direction}'>${name}</strong><span lang='en' dir='ltr'>BOWDY AGENT</span></div>
    </div>
    <div class='agent-profile-copy'>
      <div class='agent-profile-heading'>
        <div><span class='agent-category'>${category}</span><h2>${name}</h2><p>${role}</p></div>
        <span class='agent-code' lang='en' dir='ltr'>${agent.code}</span>
      </div>
      <blockquote>${quote}</blockquote>
      <div class='agent-situation'><small>${pick(english, 'يدخل لما...', 'Steps in when...')}</small><p>${scenario}</p></div>
      <div class='agent-task-panel'>
        <h3>${pick(english, 'يمسك إيش؟', 'What it handles')}</h3>
        <ol>${tasks.map((task, taskIndex) => `<li><span>${String(taskIndex + 1).padStart(2, '0')}</span><p>${task}</p></li>`).join('')}</ol>
      </div>
      <div class='agent-impact'><span>${pick(english, 'الأثر', 'Impact')}</span><p>${impact}</p></div>
      <div class='agent-profile-action'><p>“${note}”</p><a class='text-link' href='/contact/?service=ai-agents&amp;agent=${agent.slug}'>${pick(english, 'ناقش تشغيله', 'Discuss this agent')} <span aria-hidden='true'>↗</span></a></div>
    </div>
  </article>`;
}

export function agentsPageModel(language = 'ar') {
  const english = language === 'en';
  const path = english ? '/en/agents/' : '/agents/';
  const title = pick(
    english,
    'وكلاء ذكاء اصطناعي سعوديون للأعمال',
    'Saudi AI Agents for Business',
  );
  const description = pick(
    english,
    'تعرّف على عشرة وكلاء ذكاء اصطناعي من باودي لابز للفوترة وخدمة العملاء والأمن والمعرفة والمشاريع والسحابة والمبيعات والتحليلات.',
    'Meet ten BOWDY LABS AI agents for finance, customer experience, cybersecurity, knowledge, projects, cloud, sales and executive analytics.',
  );
  const itemListId = `${site.url}${path}#agent-lineup`;
  const serviceSchemas = agents.map((agent) => ({
    '@type': 'Service',
    '@id': `${site.url}${path}#${agent.slug}-service`,
    name: english ? agent.nameEn : agent.name,
    alternateName: english ? agent.name : agent.nameEn,
    serviceType: english ? agent.roleEn : agent.role,
    description: english ? agent.scenarioEn : agent.scenario,
    url: `${site.url}${path}#${agent.slug}`,
    provider: { '@id': `${site.url}/#organization` },
    areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
    audience: { '@type': 'BusinessAudience', audienceType: 'Organizations and business teams' },
  }));
  const itemList = {
    '@type': 'ItemList',
    '@id': itemListId,
    name: english ? 'BOWDY LABS AI Agent Lineup' : 'فريق وكلاء باودي لابز للذكاء الاصطناعي',
    numberOfItems: agents.length,
    itemListElement: agents.map((agent, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: english ? agent.nameEn : agent.name,
      url: `${site.url}${path}#${agent.slug}`,
      item: { '@id': `${site.url}${path}#${agent.slug}-service` },
    })),
  };
  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `${site.url}${path}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: english ? 'Home' : 'الرئيسية',
        item: `${site.url}${english ? '/en/' : '/'}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: english ? 'AI Agents' : 'وكلاء باودي',
        item: `${site.url}${path}`,
      },
    ],
  };
  const heroAgents = [agents[3], agents[4], agents[8]];
  const principles = english
    ? [
        ['01', 'Discover', 'Define the job, data and measurable outcome.'],
        ['02', 'Design', 'Map permissions, guardrails and human approvals.'],
        ['03', 'Build', 'Connect the agent to the real operating system.'],
        ['04', 'Scale', 'Measure value, learn and expand with control.'],
      ]
    : [
        ['01', 'اكتشف', 'نحدد المهمة والبيانات والنتيجة القابلة للقياس.'],
        ['02', 'صمّم', 'نرسم الصلاحيات والقيود ونقاط الموافقة البشرية.'],
        ['03', 'ابنِ', 'نربط الوكيل بالنظام الحقيقي الذي يعمل عليه الفريق.'],
        ['04', 'كبّر', 'نقيس القيمة ونتعلم ثم نتوسع بهدوء وتحكم.'],
      ];

  return {
    title,
    description,
    path,
    active: 'agents',
    language,
    alternatePath: { ar: '/agents/', en: '/en/agents/' },
    schema: [itemList, breadcrumbSchema, ...serviceSchemas],
    mainEntity: { '@id': itemListId },
    body: `<nav class='breadcrumbs container' aria-label='${english ? 'Breadcrumb' : 'مسار التنقل'}'><ol><li><a href='${english ? '/en/' : '/'}'>${english ? 'Home' : 'الرئيسية'}</a></li><li><span aria-current='page'>${english ? 'AI Agents' : 'وكلاء باودي'}</span></li></ol></nav>
    <section class='agents-hero section-pad'>
      <div class='container agents-hero-grid'>
        <div class='agents-hero-copy reveal'>
          <span class='eyebrow'><i aria-hidden='true'></i>${pick(english, 'فريق سعودي بهوية باودي', 'A Saudi team with BOWDY identity')}</span>
          <p class='hero-kicker' lang='en' dir='ltr'>BOWDY AGENTS · SPECIAL ISSUE 01</p>
          <h1>${pick(english, 'كل وكيل ماسك مهمة... <span>والكل مربوط بمنظومة واحدة.</span>', 'One agent per mission. <span>One governed system behind the team.</span>')}</h1>
          <p>${pick(english, 'مو شخصيات للاستعراض، ولا روبوتات تحفظ ردوداً. هؤلاء وكلاء أعمال نصممهم حول مهمة واضحة وبيانات موثوقة وصلاحيات محددة وأثر يمكن قياسه.', 'Not mascots and not scripted bots. These are business agents designed around a clear job, trusted data, explicit permissions and measurable impact.')}</p>
          <div class='hero-actions'><a class='button' href='#agent-lineup'>${pick(english, 'قابل الفريق', 'Meet the team')} <span aria-hidden='true'>↓</span></a><a class='button button-ghost' href='/contact/?service=ai-agents'>${pick(english, 'صمّم وكيلك', 'Design your agent')}</a></div>
          <div class='agents-hero-proof'><span>${pick(english, 'عربي من الأصل', 'Arabic-first')}</span><span>${pick(english, 'أمان منذ التصميم', 'Secure by design')}</span><span>${pick(english, 'إنسان داخل القرار', 'Human-governed')}</span></div>
        </div>
        <div class='agents-hero-visual reveal' aria-hidden='true'>
          <span class='agents-hero-orbit agents-hero-orbit-one'></span><span class='agents-hero-orbit agents-hero-orbit-two'></span>
          <div class='agents-hero-core'><img src='${site.logo}' width='72' height='72' alt=''><small lang='en' dir='ltr'>BOWDY LABS</small><strong lang='en' dir='ltr'>AGENTIC AI</strong></div>
          ${heroAgents.map((agent, index) => `<div class='agents-hero-avatar agents-hero-avatar-${index + 1}'><img src='${imagePath(agent, 520)}' width='520' height='520' alt=''><span lang='${english ? 'en' : 'ar'}'>${english ? agent.nameEn : agent.name}</span></div>`).join('')}
          <span class='agents-hero-signal' lang='en' dir='ltr'>INTELLIGENCE · INNOVATION · IMPACT</span>
        </div>
      </div>
    </section>
    <nav class='agent-index' aria-label='${pick(english, 'انتقل إلى أحد الوكلاء', 'Jump to an agent')}'><div class='container agent-index-track'>${agents.map((agent) => `<a href='#${agent.slug}' style='--agent-accent:${agent.accent}'><small>${agent.code}</small><strong>${english ? agent.nameEn : agent.name}</strong></a>`).join('')}</div></nav>
    <section class='agents-intro section-pad'><div class='container agents-intro-grid'>
      <div class='section-head reveal'><span class='eyebrow'><i aria-hidden='true'></i>${pick(english, 'الفكرة ببساطة', 'The idea, simply')}</span><h2>${pick(english, 'المشكلة مو نقص أدوات.<br>المشكلة: مين يمسك المهمة؟', 'The problem is not a lack of tools.<br>It is who owns the job.')}</h2><p>${pick(english, 'كل وكيل له نطاق واضح، ومصدر بيانات معروف، وصلاحيات لا يتجاوزها، ومؤشر نجاح يفهمه فريق العمل.', 'Every agent has a clear scope, known data sources, hard permission boundaries and a success metric the team understands.')}</p></div>
      <div class='agents-intro-principles'>
        <article class='reveal'><span>01</span><h3>${pick(english, 'مهمة واضحة', 'A clear job')}</h3><p>${pick(english, 'يبدأ من عمل يتكرر ويستهلك وقتاً أو يفقد فرصة.', 'Starts with repeatable work that consumes time or loses value.')}</p></article>
        <article class='reveal'><span>02</span><h3>${pick(english, 'صلاحيات محكومة', 'Governed access')}</h3><p>${pick(english, 'لا يرى ولا ينفذ أكثر مما تسمح به السياسة.', 'Sees and acts only within approved policy.')}</p></article>
        <article class='reveal'><span>03</span><h3>${pick(english, 'أثر قابل للقياس', 'Measurable impact')}</h3><p>${pick(english, 'نقيس الوقت والجودة والتكلفة والنتيجة التجارية.', 'Measures time, quality, cost and business outcome.')}</p></article>
      </div>
    </div></section>
    <section class='agent-roster section-pad' id='agent-lineup'><div class='container'>
      <div class='section-head reveal'><span class='eyebrow'><i aria-hidden='true'></i>${pick(english, 'العدد الخاص الأول', 'Special issue one')}</span><h2>${pick(english, 'تعرّف على فريق باودي', 'Meet the BOWDY lineup')}</h2><p>${pick(english, 'عشرة وكلاء. عشر مهام حقيقية. وأسلوب واحد: ذكاء يعمل داخل الحوكمة ويُحاسب على الأثر.', 'Ten agents. Ten real jobs. One standard: intelligence inside governance, accountable to impact.')}</p></div>
      <div class='agent-roster-list'>${agents.map((agent, index) => agentProfile(agent, index, english)).join('')}</div>
    </div></section>
    <section class='agent-method section-pad'><div class='container'>
      <div class='section-head reveal'><span class='eyebrow'><i aria-hidden='true'></i>${pick(english, 'لا نرمي وكيلاً داخل الشركة ونمشي', 'Built to operate, not to demo')}</span><h2>${pick(english, 'رحلة الوكيل من الفكرة إلى أثر مثبت', 'From idea to proven operational impact')}</h2></div>
      <div class='agent-method-grid'>${principles.map(([number, heading, copy]) => `<article class='reveal'><span>${number}</span><h3>${heading}</h3><p>${copy}</p></article>`).join('')}</div>
      <div class='agent-governance-note reveal'><img src='${site.logo}' width='72' height='72' alt=''><div><small lang='en' dir='ltr'>SECURITY BY DESIGN</small><h3>${pick(english, 'الاستقلالية لها حدود واضحة', 'Autonomy has explicit boundaries')}</h3><p>${pick(english, 'القرارات الحساسة والموافقات المالية والإجراءات الأمنية تبقى داخل سياسات مكتوبة ومسار مراجعة بشري وسجل قابل للتدقيق.', 'Sensitive decisions, financial approvals and security actions remain inside written policy, human review and an auditable trail.')}</p></div></div>
    </div></section>
    <section class='cta-section section-pad'><div class='container cta-panel reveal'><div><span class='eyebrow'><i aria-hidden='true'></i>${pick(english, 'ابدأ من المشكلة', 'Start with the problem')}</span><h2>${pick(english, 'قل لنا: إيش يضيع وقت فريقك كل يوم؟', 'What steals your team’s time every day?')}</h2><p>${pick(english, 'نختار أنسب وكيل، أو نصمم وكيلاً جديداً حول نظامك وبياناتك وطريقة عملك.', 'We will select the right agent or design a new one around your systems, data and operating model.')}</p></div><a class='button' href='/contact/?service=ai-agents'>${pick(english, 'ناقش وكيلك الأول', 'Discuss your first agent')} <span aria-hidden='true'>↗</span></a></div></section>`,
  };
}
