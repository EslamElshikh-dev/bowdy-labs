// Approved core prices from the owner's 3 November brief. Add-ons remain quote-only.
export const commercialDate = "2026-11-04";

export const plans = [
  {
    id: "launch", setup: 1500, monthly: 690,
    ar: { name: "انطلق", type: "وكيل رُدّ مُدار", audience: "لنشاط صغير أو متوسط تكثر عليه رسائل واتساب والموقع.", price: "690", suffix: "ريال / شهر", secondary: "+ 1,500 ريال تأسيس لمرة واحدة", timeline: "تشغيل مستهدف خلال 7 أيام بعد اكتمال المتطلبات.", features: ["رُدّ على واتساب وموقعك باللهجة السعودية", "إعداد المعرفة من خدماتك وأسعارك", "تحويل لموظف مع ملخص للمحادثة", "حتى 1,500 محادثة شهريًا؛ تعريف المحادثة وحد التجاوز يُحددان في العرض", "تكامل واحد ضمن النطاق، ولوحة وتقرير شهري"] },
    en: { name: "Launch", shortAudience: "For frequent WhatsApp and website enquiries.", type: "Managed Rudd agent", audience: "For small and medium businesses handling frequent WhatsApp and website enquiries.", price: "690", suffix: "SAR / month", secondary: "+ SAR 1,500 one-time setup", timeline: "Target: live within 7 days after prerequisites are complete.", features: ["Rudd on WhatsApp and your website in Saudi Arabic", "Knowledge setup using your services and prices", "Human handoff with a conversation summary", "Up to 1,500 conversations per month; counting and overages defined in your quote", "One scoped integration, dashboard and monthly report"] },
  },
  {
    id: "build", project: 7500, maxProject: 25000, monthly: 990,
    ar: { name: "اشتغل", type: "وكيل مخصص لمشروعك", audience: "لشركة تريد وكيلًا مربوطًا بوثائقها أو أنظمتها؛ مثل سَلْني أو نَمِّ أو زَوِّد.", price: "7,500", suffix: "ريال / مشروع — تبدأ من", secondary: "النطاق المعتاد 7,500–25,000 ريال · تشغيل اختياري 990 ريال / شهر", timeline: "تسليم مستهدف خلال 2–4 أسابيع بحسب النطاق وجاهزية البيانات.", features: ["تحليل العملية والبيانات واختيار مهمة واحدة", "بحث في الوثائق مع المصادر عند اختيار سَلْني", "حتى 5 تكاملات متفق عليها: سلة، زد، Odoo، CRM أو Google", "صلاحيات لكل دور وسجلات مراجعة", "تقييم قبل الإطلاق وتدريب الفريق"] },
    en: { name: "Build", shortAudience: "One custom agent connected to your systems.", type: "An agent built for your business", audience: "For a company connecting an agent to its documents or systems, such as Salni, Nammi or Zawwid.", price: "7,500", suffix: "SAR / project — from", secondary: "Typical scope: SAR 7,500–25,000 · optional operations SAR 990 / month", timeline: "Target: 2–4 weeks, depending on scope and data readiness.", features: ["Process and data discovery for one selected job", "Document search with citations when choosing Salni", "Up to 5 agreed integrations: Salla, Zid, Odoo, CRM or Google", "Role-based permissions and audit logs", "Pre-launch evaluation and team training"] },
  },
  {
    id: "scale", project: 30000,
    ar: { name: "توسّع", type: "منظومة مؤسسات", audience: "لمؤسسة أو جهة منظّمة تحتاج عدة وكلاء ومتطلبات تشغيل واستضافة محددة.", price: "بطلب عرض", suffix: "المرحلة الأولى عادةً من 30,000 ريال", secondary: "نطاق ومراحل وتكاليف تشغيل متفق عليها قبل التنفيذ", timeline: "خطة مرحلية بحسب التكاملات ومراجعات الجهة.", features: ["عدة وكلاء على منظومة واحدة ضمن نطاق واضح", "خيار استضافة سعودية أو داخل منشأتك بحسب المتطلبات", "تكامل أَمِّن مع SOC أو EDR حسب النطاق", "وثائق جاهزية لضوابط NCA ومتطلبات PDPL", "اتفاق مستوى خدمة ومدير حساب"] },
    en: { name: "Scale", shortAudience: "Multiple agents and regulated hosting needs.", type: "Enterprise agent system", audience: "For enterprises and regulated organisations with multiple agents and specific hosting requirements.", price: "Request a quote", suffix: "First phase typically from SAR 30,000", secondary: "Scope, delivery stages and operations agreed before implementation", timeline: "Phased delivery based on integrations and organisational reviews.", features: ["Multiple agents in one scoped system", "Saudi hosting or on-premises options as specified", "Ammin integration with SOC or EDR where scoped", "Readiness documentation for NCA controls and PDPL requirements", "Agreed service levels and an account manager"] },
  },
];

export const homeFaq = {
  ar: [
    ["وين تُستضاف بياناتي؟", "نحدد مكان التخزين والمعالجة ومزوّد النموذج قبل الربط. الاستضافة داخل المملكة خيار يُدرج في نطاق المشروع عند الطلب، مع التحقق من موقع معالجة النموذج أيضًا. نختار إعدادات ومزوّدين لا يستخدمون وثائقك لتدريب نماذج عامة وفق الاتفاق."],
    ["كم يأخذ الوكيل حتى يشتغل؟", "نراجع مهمتك وجاهزية البيانات أولًا، ثم نؤكد موعد التجربة المجانية قبل أي دفع. التشغيل المستهدف لباقة انطلق 7 أيام، وللوكيل المخصص 2–4 أسابيع بعد اكتمال المتطلبات؛ والنطاق النهائي يحدد الموعد."],
    ["هل أحتاج فريقًا تقنيًا؟", "لا تحتاج مبرمجًا لإدارة الاستخدام اليومي. نبني الوكيل وندرّب فريقك، وتشمل باقة انطلق التشغيل والصيانة؛ ويكون التشغيل اختياريًا في اشتغل وباتفاق محدد في توسّع."],
  ],
  en: [
    ["Where is my data hosted?", "Storage and model-processing locations are agreed before integration. Saudi hosting is a scoped option. Provider terms and settings exclude your documents from public-model training as agreed."],
    ["How long does an agent take to launch?", "We assess readiness and confirm a free trial date before payment. Launch targets 7 days; Build 2–4 weeks after prerequisites, subject to scope."],
    ["Do I need a technical team?", "No programmer is needed for daily use. We train your team. Operations are included in Launch, optional in Build and scoped for Scale."],
  ],
};

export const pricingFaq = {
  ar: [
    homeFaq.ar[0],
    ["كم تكلفة رسائل واتساب؟", "رسوم رسائل واتساب من Meta غير مشمولة في الباقة، وتُسدّد بحسب حسابك ومسار الفوترة المعتمد. لا نضيف هامشًا على رسوم Meta؛ وأي رسوم مستقلة لمزوّد قناة خارجي تُوضح في العرض قبل التعاقد."],
    ["هل أحتاج مبرمجًا في فريقي؟", "لا. نجهّز الوكيل وندرّب فريقك على لوحة بسيطة. التشغيل والصيانة مشمولان في انطلق، واختياريان بـ990 ريال شهريًا في اشتغل، ويُحددان في اتفاق توسّع."],
    ["ماذا لو سأل العميل شيئًا لا يعرفه الوكيل؟", "نصمم الوكيل لطلب التوضيح أو التصريح بعدم توفر إجابة ثم التحويل إلى موظف مع ملخص. نختبر هذا السلوك قبل الإطلاق ونراقبه أثناء التشغيل، مع بقاء المراجعة البشرية للقرارات الحساسة."],
    ["هل أقدر أوقف الاشتراك؟", "نعم، يُلغى الاشتراك الشهري بإشعار 30 يومًا بلا رسوم إلغاء، وتستلم تصدير بياناتك ومحادثاتك ضمن النطاق المتفق عليه. رسوم التأسيس لا تُسترد بعد بدء التنفيذ لأنها تغطي الإعداد والتدريب والربط. التجربة مجانية قبل أي دفع، ويؤكد الفريق موعدها بعد مراجعة المهمة."],
    ["هل تعملون مع جهات حكومية أو منظّمة؟", "نراجع متطلبات هذه الجهات ضمن باقة توسّع، بما فيها الاستضافة وتدفق البيانات ومستوى الخدمة ووثائق الجاهزية. يُعتمد النطاق بعد التقييم؛ ولا تمثل وثائق الجاهزية شهادة اعتماد من NCA أو ضمان امتثال شامل."],
  ],
  en: [
    homeFaq.en[0],
    ["What do WhatsApp messages cost?", "Meta WhatsApp message charges are separate and paid through your approved account and billing route. We add no markup to Meta charges. Any separate channel-provider fees are identified in the quote before contracting."],
    ["Do I need a developer on my team?", "No. We configure the agent and train your team on a simple dashboard. Operations and maintenance are included in Launch, optional at SAR 990 per month in Build and agreed separately in Scale."],
    ["What happens when the agent does not know?", "We design and test clarification, explicit uncertainty and a handoff to a team member with a summary. This behaviour is evaluated before launch and monitored during operations; sensitive decisions retain human review."],
    ["Can I cancel my subscription?", "Yes, with 30 days’ notice and no cancellation fee. Your data and conversations are exported within the agreed scope. Setup fees are non-refundable once implementation starts because they cover configuration, training and integrations. A trial is free before payment, with its date confirmed after reviewing the job."],
    ["Can you support government or regulated organisations?", "We assess these requirements under Scale, including hosting, data flows, service levels and readiness documentation. Scope is agreed after assessment. Readiness documents are not NCA certification or a blanket compliance guarantee."],
  ],
};

export const addOns = [
  { ar: ["GEO وSEO محلي", "محتوى وبيانات منظمة وتحسين ملف Google، مع تقرير للمخرجات؛ دون ضمان ظهور في إجابة أو ترتيب محدد."], en: ["GEO and local SEO", "Content, structured data and Google profile improvements with a delivery report; no guaranteed answer placement or ranking."] },
  { ar: ["تهيئة أو استعادة ملف Google التجاري", "مراجعة الأهلية والأدلة والتواصل بشأن التعليق؛ يبقى قرار التحقق أو الاستعادة لدى Google."], en: ["Google Business Profile setup or recovery", "Eligibility and evidence review, and suspension support. Google decides verification and reinstatement."] },
  { ar: ["إدارة إعلانات Google", "حملات وقياس تحويلات وربط بالوكيل عند ملاءمته وتقرير أداء؛ ميزانية الإعلان مستقلة."], en: ["Google Ads management", "Campaigns, conversion tracking, suitable agent integration and reporting; media spend is separate."] },
  { ar: ["فحص أمني", "تقرير للثغرات ورؤوس الأمان وتوصيات وإعادة فحص ضمن النطاق المصرّح به كتابيًا."], en: ["Security assessment", "A scoped findings report, security-header review, recommendations and retesting with written authorisation."] },
  { ar: ["وكيل إضافي", "مهمة ثانية على المنظومة نفسها، بصلاحيات وبيانات وتكلفة تشغيل تُحدد في العرض."], en: ["Additional agent", "A second job in the same system, with permissions, data and operations priced in the quote."] },
  { ar: ["قناة إضافية", "إنستقرام أو قناة صوتية بحسب توفر التكامل والموافقات ورسوم المزوّد."], en: ["Additional channel", "Instagram or voice, subject to integration availability, approvals and provider charges."] },
];

export const comparison = [
  { ar: ["المهمة الأساسية", "رُدّ على واتساب والموقع", "وكيل واحد حسب المهمة", "عدة وكلاء حسب النطاق"], en: ["Core job", "Rudd on WhatsApp and web", "One agent for the selected job", "Multiple scoped agents"] },
  { ar: ["بحث الوثائق مع المصادر RAG", "غير مشمول", "عند اختيار مسار الوثائق", "ضمن النطاق المتفق عليه"], en: ["Document search with citations", "Not included", "When selecting the document-search scope", "As scoped"] },
  { ar: ["ربط الأنظمة", "تكامل واحد", "حتى 5 تكاملات", "حسب الاتفاق"], en: ["System integrations", "One", "Up to five", "As agreed"] },
  { ar: ["الصلاحيات وسجلات المراجعة", "أساسية", "لكل دور + سجلات", "كاملة ضمن نطاق الحوكمة"], en: ["Permissions and audit logs", "Basic", "Role-based + logs", "Scoped governance controls"] },
  { ar: ["استضافة داخل السعودية", "خيار بطلب عرض", "خيار بطلب عرض", "حسب متطلبات الجهة"], en: ["Saudi hosting", "Quoted option", "Quoted option", "To organisational requirements"] },
  { ar: ["وثائق جاهزية NCA وPDPL", "غير مشمولة", "ملخص للنطاق", "وثائق ضمن النطاق"], en: ["NCA and PDPL readiness documents", "Not included", "Scope summary", "Scoped documentation"] },
  { ar: ["التقارير", "شهري", "شهري ولوحة عند اختيار التشغيل", "دورية متفق عليها + مدير حساب"], en: ["Reporting", "Monthly", "Monthly + dashboard with operations", "Agreed cadence + account manager"] },
  { ar: ["الدعم والتشغيل", "واتساب في ساعات العمل", "اختياري + اجتماع شهري", "اتفاق مستوى خدمة محدد"], en: ["Support and operations", "WhatsApp during working hours", "Optional + monthly meeting", "Defined service agreement"] },
];

export const metadata = {
  ar: {
    home: { title: "شركة ذكاء اصطناعي في الرياض — وكلاء AI آمنون للشركات | باودي لابز", description: "باودي لابز تبني وتشغّل وكلاء ذكاء اصطناعي للشركات في الرياض: خدمة عملاء، بحث في الوثائق، مراقبة أمنية وحملات Google، مع صلاحيات محددة وخيارات استضافة سعودية. اطلب تجربة مجانية.", ogTitle: "وكلاء ذكاء اصطناعي آمنون للشركات السعودية — اطلب تجربة مجانية" },
    pricing: { title: "أسعار وكلاء الذكاء الاصطناعي للشركات | باودي لابز", description: "قارن باقات باودي لابز: انطلق بتأسيس 1,500 و690 ريال شهريًا، واشتغل من 7,500 ريال للمشروع، وتوسّع بعرض مخصص. أسعار شاملة الضريبة وحدود واضحة وتجربة مجانية قبل الدفع." },
    services: { title: "خدمات الذكاء الاصطناعي والأمن والتكاملات في الرياض | باودي لابز", description: "استكشف خدمات باودي لابز الداعمة لتشغيل الوكلاء: حماية الأنظمة والسحابة وتطوير البرمجيات وربط البيانات وملفات Google والإعلانات والبحث، بنطاق ومخرجات واضحة." },
  },
  en: {
    home: { title: "AI Agents Company in Riyadh, Saudi Arabia — Secure by Design | BOWDY LABS", description: "BOWDY LABS builds and runs secure AI agents for Saudi businesses: customer service, document search, security monitoring and Google growth, with scoped permissions. Request a free trial.", ogTitle: "Secure AI agents for Saudi businesses — request a free trial" },
    pricing: { title: "AI Agent Pricing for Saudi Businesses | BOWDY LABS", description: "Compare BOWDY LABS plans: SAR 1,500 setup plus 690 monthly for Launch, Build from SAR 7,500 per project, and custom Scale. VAT included, clear limits and a free trial before payment." },
    services: { title: "AI, Security and Integration Services in Riyadh | BOWDY LABS", description: "Explore the engineering behind BOWDY agents: cybersecurity, cloud, software, data integration, Google Business Profile, advertising and search, with clear scope and deliverables." },
  },
};
