import { businessSystems, systemsUi } from "./business-systems-content.mjs";
import { services } from "./content.mjs";
import { serviceCopy } from "./commercial-pages.mjs";

export const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const pick = (lang, ar, en) => lang === "en" ? en : ar;
const el = (tag, attrs, body = "") => "<" + tag + Object.entries(attrs || {}).filter(([, value]) => value !== false && value != null).map(([name, value]) => " " + name + '="' + esc(value === true ? "" : value) + '"').join("") + ">" + body + "</" + tag + ">";
const div = (cls, body, attrs = {}) => el("div", { class: cls, ...attrs }, body);
const text = (tag, value, attrs) => el(tag, attrs, esc(value));
const p = (value, cls = "") => text("p", value, { class: cls });
const small = (value, cls = "") => text("span", value, { class: cls });
const route = (lang, slug = "") => (lang === "en" ? "/en" : "") + "/services/" + (slug ? slug + "/" : "");
const contact = (lang, slug) => (lang === "en" ? "/en" : "") + "/contact/?service=" + slug;
const arrow = () => '<span class="bs-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg></span>';
const link = (href, label, cls = "bs-button", extra = {}) => el("a", { href, class: cls, ...extra }, esc(label) + arrow());
const button = (action, label, attrs = {}) => text("button", label, { type: "button", class: "bs-control", "data-action": action, ...attrs });
const sectionHead = (kicker, title, description = "") => div("bs-section-head", small(kicker, "bs-kicker") + text("h2", title) + (description ? p(description) : ""));

export function systemIcon(key) {
  const paths = {
    pipeline: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="6" rx="1.5"/>',
    dashboard: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 16v-4m5 4V8m5 8v-6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2"/>',
    chat: '<path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-6a8 8 0 0 1-1-5 8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/><path d="M7 10h10m-10 4h6"/>',
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[key] + "</svg>";
}

function crmDemo(lang) {
  const card = div("bs-lead-card", small("REQ–104", "bs-mono") + text("h3", pick(lang, "زيارة استشارية", "Consultation visit")) + p(pick(lang, "طلب من نموذج الموقع", "Website enquiry")) + div("bs-record-line", small(pick(lang, "المسؤول", "Owner")) + text("strong", pick(lang, "غير مسند", "Unassigned"), { "data-crm-owner": "" })) + div("bs-record-line", small(pick(lang, "الخطوة التالية", "Next action")) + text("strong", pick(lang, "تحديد متابعة", "Set follow-up"), { "data-crm-next": "" })), { "data-crm-card": "" });
  const stages = pick(lang, ["طلب جديد", "تم الإسناد", "متابعة محددة"], ["New enquiry", "Assigned", "Follow-up set"]);
  return div("bs-demo-heading", text("h2", pick(lang, "مسار متابعة العملاء", "Customer pipeline")) + small(pick(lang, "سجل واحد", "One record"), "bs-pill")) +
    div("bs-flow-steps", stages.map((name, i) => div(i === 0 ? "is-active" : "", small("0" + (i + 1)) + small(name), { "data-crm-step": i })).join("")) +
    div("bs-kanban", stages.map((name, i) => div("bs-stage" + (i === 0 ? " is-active" : ""), small(name, "bs-column-label") + (i === 0 ? card : div("bs-stage-empty", "···")), { "data-crm-column": i })).join("")) +
    div("bs-demo-actions", button("assign", pick(lang, "أسند الطلب", "Assign owner")) + button("followup", pick(lang, "حدّد متابعة", "Set follow-up")) + button("duplicate", pick(lang, "جرّب طلبًا مكررًا", "Repeat the enquiry"), { class: "bs-control bs-control-quiet" }));
}

function bookingDemo(lang) {
  return div("bs-demo-heading", text("h2", pick(lang, "حجز زيارة استشارية", "Book a consultation")) + small(pick(lang, "جدول تجريبي", "Sample schedule"), "bs-pill")) +
    div("bs-booking-service", div("bs-service-icon", systemIcon("calendar")) + div("", text("h3", pick(lang, "خدمة استشارية", "Consultation service")) + p(pick(lang, "مقدم خدمة واحد · يوم عرض تجريبي", "One provider · sample booking day")))) +
    el("fieldset", { class: "bs-slots" }, text("legend", pick(lang, "اختر وقتًا لتجربته", "Choose a sample time")) + ["09:00", "10:30", "12:00"].map((slot, i) => el("label", {}, '<input type="radio" name="demo-time" value="' + slot + '"' + (i === 0 ? " checked" : "") + '><span dir="ltr">' + slot + "</span>")).join("")) +
    div("bs-booking-ticket", small(pick(lang, "حالة الموعد", "Appointment status"), "bs-column-label") + text("strong", pick(lang, "اختر وقتًا ثم أكّد الحجز", "Choose a time, then confirm"), { "data-booking-summary": "" }) + p(pick(lang, "التأكيد والتعديل هنا للشرح فقط.", "Confirmation and changes here are illustrative."))) +
    div("bs-demo-actions", button("confirm", pick(lang, "أكّد الموعد", "Confirm time")) + button("edit", pick(lang, "عدّل الموعد", "Reschedule")) + button("conflict", pick(lang, "اختبر تعارضًا", "Try a conflict"), { class: "bs-control bs-control-quiet" }));
}

function selectControl(label, attr, options, selected) {
  return el("label", { class: "bs-select-label" }, small(label) + el("select", { [attr]: "", "aria-label": label }, options.map(([value, name]) => text("option", name, { value, selected: value === selected })).join("")));
}

function dashboardDemo(lang) {
  const filter = selectControl(pick(lang, "الفرع", "Location"), "data-dashboard-branch", [["all", pick(lang, "كل الفروع", "All locations")], ["main", pick(lang, "الرئيسي", "Main")], ["north", pick(lang, "الشمال", "North")]], "all");
  const role = selectControl(pick(lang, "دور العرض", "View as"), "data-dashboard-role", [["staff", pick(lang, "موظف", "Staff")], ["manager", pick(lang, "مدير", "Manager")]], "staff");
  return div("bs-demo-heading", text("h2", pick(lang, "مركز المتابعة", "Operations overview")) + small(pick(lang, "بيانات عرض", "Sample data"), "bs-pill")) +
    div("bs-dashboard-filters", filter + role) +
    div("bs-stats", [["requests", "12", pick(lang, "طلبات", "Requests")], ["followups", "9", pick(lang, "متابعات محددة", "Next actions")], ["waiting", "3", pick(lang, "بانتظار إجراء", "Need attention")]].map(([key, value, label]) => div("bs-stat", text("strong", value, { "data-stat": key }) + small(label))).join("")) +
    div("bs-chart", div("bs-chart-head", small(pick(lang, "توزيع الطلبات", "Request distribution")) + small(pick(lang, "مصدر تجريبي متاح", "Sample source available"), "bs-source", { })) + '<div class="bs-bars" aria-hidden="true"><i style="--bar:42%"></i><i style="--bar:68%"></i><i style="--bar:55%"></i><i style="--bar:84%"></i><i style="--bar:64%"></i><i style="--bar:94%"></i><i style="--bar:73%"></i></div>' + p(pick(lang, "حالة البيانات: محدثة داخل النموذج", "Data status: updated in this example"), "bs-source-detail").replace('<p class="bs-source-detail">', '<p class="bs-source-detail" data-source-status>')) +
    div("bs-approval-row", div("", text("strong", pick(lang, "طلب يحتاج اعتمادًا", "Request awaiting approval"), { "data-approval-label": "" }) + p(pick(lang, "REQ–108 · جرّب دور الموظف ثم المدير", "REQ–108 · try staff, then manager"))) + button("approve", pick(lang, "اعتمد الطلب", "Approve request"))) +
    div("bs-demo-actions", button("source", pick(lang, "اختبر انقطاع المصدر", "Toggle source connection"), { class: "bs-control bs-control-quiet" }));
}

function chatDemo(lang) {
  return div("bs-demo-heading", div("bs-chat-identity", '<img src="/assets/media/agents/rudd-520.webp" width="42" height="42" alt="">' + div("", text("h2", pick(lang, "رُدّ · مساعد العملاء", "Rudd · customer assistant")) + p(pick(lang, "تجربة باختيارات محددة", "A preset conversation example")))) + small(pick(lang, "نموذج توضيحي", "Illustrative"), "bs-pill")) +
    div("bs-chat-messages", div("bs-chat-bubble bs-chat-agent", esc(pick(lang, "أهلًا بك. اختر استفسارًا لترى كيف تصل المحادثة إلى خطوة واضحة.", "Welcome. Choose an enquiry to explore a conversation with a useful next step."))), { "data-chat-messages": "" }) +
    div("bs-chat-prompts", button("help", pick(lang, "ما خدماتكم؟", "What services do you offer?")) + button("booking", pick(lang, "أريد حجز زيارة", "I need an appointment")) + button("unknown", pick(lang, "سؤال خارج المعرفة", "An unknown question"))) +
    div("bs-handoff-record", small("DEMO–203", "bs-mono") + text("strong", pick(lang, "طلب تحويل توضيحي", "Sample handover record")) + p(pick(lang, "ملخص وسبب تحويل ومسؤول متابعة.", "A summary, handover reason and follow-up owner.")), { "data-chat-record": "", hidden: true }) +
    div("bs-demo-actions", button("handoff", pick(lang, "جرّب التحويل للفريق", "Try team handover"), { class: "bs-control bs-control-quiet" }));
}

export function renderDemo(service, lang) {
  const ui = systemsUi[lang];
  const body = { crm: crmDemo, booking: bookingDemo, dashboard: dashboardDemo, chat: chatDemo }[service.key](lang);
  return div("bs-demo-window", div("bs-window-bar", div("bs-window-dots", "<i></i><i></i><i></i>") + small("BOWDY / WORKSPACE", "bs-mono") + button("reset", ui.reset, { class: "bs-reset" })) +
    div("bs-demo-body", small(ui.synthetic, "bs-demo-badge") + body + p(pick(lang, "اختر إجراءً لتجربة المسار.", "Choose an action to explore the workflow."), "bs-demo-status").replace('<p class="bs-demo-status">', '<p class="bs-demo-status" data-demo-status role="status" aria-live="polite">')) +
    p(ui.local, "bs-demo-disclosure"), { "data-business-demo": service.key, "data-lang": lang, id: "workflow-demo" });
}

export function renderPlanner(lang, key = "crm") {
  const ui = systemsUi[lang];
  const index = businessSystems.findIndex(s => s.key === key);
  const controls = selectControl(ui.problemLabel, "data-plan-problem", businessSystems.map((s, i) => [s.key, ui.problems[i]]), key) +
    selectControl(ui.toolsLabel, "data-plan-tools", ["sheets", "platform", "several"].map((value, i) => [value, ui.tools[i]]), "sheets") +
    selectControl(ui.approvalLabel, "data-plan-approval", [["yes", ui.approvals[0]], ["no", ui.approvals[1]]], "yes");
  const cell = (label, value, attr) => div("bs-plan-cell", small(label) + text("p", value, { [attr]: "" }));
  const results = cell(ui.route, ui.paths[0], "data-plan-route") + cell(ui.first, ui.scopes[index], "data-plan-scope") + cell(ui.acceptance, ui.checks[index], "data-plan-check") + cell(ui.approval, ui.controls[0], "data-plan-control");
  return el("section", { class: "bs-planner section-pad", id: "scope-builder", "data-business-planner": "", "data-lang": lang }, div("container", div("bs-planner-panel", sectionHead(pick(lang, "ابدأ من احتياجك", "START WITH YOUR WORKFLOW"), ui.plannerTitle, ui.plannerCopy) +
    div("bs-planner-fields", controls) + div("bs-plan-result", div("bs-plan-heading", small("01", "bs-mono") + text("h3", businessSystems[index][lang].name, { "data-plan-title": "" }) + small(pick(lang, "نطاق أولي", "INITIAL SCOPE"), "bs-pill")) + div("bs-plan-grid", results)) +
    div("bs-planner-actions", link(contact(lang, businessSystems[index].slug) + "&tools=sheets&approval=yes", ui.send, "bs-button", { "data-plan-contact": "" }) + button("download", ui.download, { class: "bs-text-button", "data-plan-download": "" })) + p(ui.planNote, "bs-fineprint") +
    '<script type="application/json" data-plan-copy>' + JSON.stringify({ ui, names: businessSystems.map(s => s[lang].name) }).replaceAll("<", "\\u003c") + "</script>")));
}

export function renderSystemsCards(lang, compact = false) {
  return div("bs-system-grid" + (compact ? " bs-system-grid-compact" : ""), businessSystems.map((s, i) => {
    const c = s[lang];
    return el("article", { class: "bs-system-card", "data-accent": s.accent },
      div("bs-card-top", div("bs-service-icon", systemIcon(s.symbol)) + small("0" + (i + 1), "bs-card-number")) +
      text("h3", c.name) + p(c.short) +
      (!compact ? p(c.intro, "bs-card-description") : "") +
      link(route(lang, s.slug), pick(lang, "استكشف الخدمة", "Explore the service"), "bs-card-link"));
  }).join(""));
}

export function renderHomeSystems(lang) {
  return el("section", { class: "bs-home section-pad", id: "business-systems" }, div("container", div("bs-home-heading", sectionHead(pick(lang, "أنظمة الأعمال", "BUSINESS SYSTEMS"), pick(lang, "عملاؤك ومواعيدك وقراراتك، في مسارات أوضح.", "Clearer customer, booking and operating workflows."), pick(lang, "أربع خدمات مستقلة، تتصل ببعضها عندما يحتاج العمل. ابدأ بالعملية التي تريد تنظيمها.", "Four independent services, connected when the workflow needs it. Start with the process you want to organize.")) + link(route(lang) + "#scope-builder", pick(lang, "حدّد نطاقك الأول", "Scope your first workflow"), "bs-button bs-button-outline")) + renderSystemsCards(lang, true)));
}

function delivery(lang) {
  const steps = pick(lang, [["نفهم العملية", "الخطوات والأدوات والمستخدمون ونقطة التعطل."], ["نراجع النموذج", "مسار أول ببيانات مناسبة ومخرجات قابلة للمراجعة."], ["نبني ونختبر", "إعداد أو ربط أو تطوير ومعايير قبول متفق عليها."], ["نسلّم وندرّب", "توثيق وتشغيل وتدريب ودعم بحسب الاتفاق."]], [["Understand", "Workflow, tools, people and the point of friction."], ["Review a prototype", "A first journey with suitable data and reviewable outputs."], ["Build and verify", "Configure, connect or develop against agreed acceptance criteria."], ["Handover and train", "Documentation, operation, training and scoped support."]]);
  return el("section", { class: "section-pad bs-delivery" }, div("container", sectionHead(pick(lang, "تنفيذ يمكن مراجعته", "REVIEWABLE DELIVERY"), pick(lang, "بداية مفهومة. وتسليم محدد.", "A clear start. A defined handover.")) + div("bs-process", steps.map(([title, copy], i) => el("article", {}, small("0" + (i + 1), "bs-process-number") + text("h3", title) + p(copy))).join(""))));
}

function governance(lang) {
  return el("section", { class: "bs-governance section-pad" }, div("container", div("bs-governance-panel", div("", small(pick(lang, "البيانات والصلاحيات", "DATA & ACCESS"), "bs-kicker") + text("h2", pick(lang, "التحكم جزء من تصميم النظام.", "Control belongs in the system design.")) + p(pick(lang, "نحدد الأدوار والبيانات والسجلات ومواقع التخزين والمعالجة وحدود التنفيذ بحسب نطاق المشروع. يبدأ الاختبار ببيانات تجريبية أو مناسبة للمشاركة.", "Define roles, data, review logs, storage and processing locations, and permitted actions within the project scope. Begin evaluation with synthetic or appropriately shareable data."))) + div("bs-governance-links", link((lang === "en" ? "/en" : "") + "/privacy/", pick(lang, "الخصوصية", "Privacy"), "bs-card-link") + link((lang === "en" ? "/en" : "") + "/terms/", pick(lang, "حدود النطاق والتشغيل", "Scope and operating terms"), "bs-card-link")))));
}

export function renderSystemPage(service, lang) {
  const c = service[lang], ui = systemsUi[lang];
  const breadcrumbs = el("nav", { class: "bs-breadcrumbs container", "aria-label": pick(lang, "مسار التنقل", "Breadcrumb") }, el("ol", {}, el("li", {}, link(lang === "en" ? "/en/" : "/", pick(lang, "الرئيسية", "Home"), "")) + el("li", {}, link(route(lang), pick(lang, "الخدمات", "Services"), "")) + text("li", c.name, { "aria-current": "location" })));
  const hero = el("section", { class: "bs-hero", "data-accent": service.accent }, div("container bs-hero-grid", div("bs-hero-copy", small(ui.eyebrow, "bs-kicker") + div("bs-service-label", systemIcon(service.symbol) + small(c.name)) + el("h1", {}, c.headline) + p(c.intro, "bs-lead") + div("bs-hero-actions", link(contact(lang, service.slug), ui.discuss) + link("#workflow-demo", ui.demo, "bs-button bs-button-outline")) + div("bs-hero-footnotes", small(pick(lang, "خدمة مستقلة", "INDEPENDENT SERVICE")) + small(pick(lang, "نطاق ومخرجات واضحة", "DEFINED SCOPE & OUTPUTS")))) + div("bs-hero-demo", renderDemo(service, lang))));
  const value = el("section", { class: "section-pad bs-value" }, div("container", div("bs-value-intro", text("h2", c.problem) + p(c.problemText)) + div("bs-outcomes", c.outcomes.map(([title, copy], i) => el("article", {}, small("0" + (i + 1), "bs-mono") + text("h3", title) + p(copy))).join(""))));
  const scope = el("section", { class: "section-pad bs-scope" }, div("container bs-scope-grid", div("bs-deliverable-panel", sectionHead(pick(lang, "من الفكرة إلى الاستخدام", "FROM IDEA TO DAILY USE"), ui.scope) + el("ul", {}, c.deliverables.map(item => text("li", item)).join(""))) + div("bs-fit-panel", text("h2", ui.fit) + el("ul", {}, c.fit.map(item => text("li", item)).join("")) + div("bs-measure", small(ui.measure) + p(c.metric)))));
  const faq = el("section", { class: "section-pad bs-faq" }, div("container bs-faq-grid", sectionHead(pick(lang, "قبل البدء", "BEFORE YOU BEGIN"), ui.faq) + div("bs-faq-list", c.faq.map(([q, a]) => el("details", {}, text("summary", q) + p(a))).join(""))));
  const related = el("section", { class: "section-pad bs-related" }, div("container", sectionHead(pick(lang, "تكامل عند الحاجة", "CONNECT WHEN IT HELPS"), ui.related) + div("bs-related-grid", businessSystems.filter(s => s.key !== service.key).map(s => el("article", { "data-accent": s.accent }, div("bs-service-icon", systemIcon(s.symbol)) + text("h3", s[lang].name) + p(s[lang].short) + link(route(lang, s.slug), pick(lang, "تفاصيل الخدمة", "Service details"), "bs-card-link"))).join(""))));
  return div("bs-site", breadcrumbs + hero + value + scope + renderPlanner(lang, service.key) + delivery(lang) + governance(lang) + faq + related);
}

export function renderServicesHub(lang) {
  const title = pick(lang, "أنظمة أوضح.<br>وعمل أكثر ترتيبًا.", "Clearer systems.<br>Better organized work.");
  const hero = el("section", { class: "bs-hub-hero bs-hero" }, div("container bs-hub-grid",
    div("bs-hero-copy", small(systemsUi[lang].eyebrow, "bs-kicker") + el("h1", {}, title) + p(pick(lang, "من إدارة العملاء والمواعيد إلى لوحات التشغيل ومساعدي المحادثة. اختر خدمة مستقلة أو اربط ما يحتاجه سير عملك.", "From customer records and appointments to operating dashboards and conversation assistants. Choose an independent service or connect the workflows you need."), "bs-lead") + div("bs-hero-actions", link("#scope-builder", pick(lang, "حدّد العملية الأولى", "Scope your first workflow")) + link("#business-systems", pick(lang, "استكشف الخدمات", "Explore the services"), "bs-button bs-button-outline"))) +
    div("bs-workspace-map", div("bs-map-top", small("BOWDY / CONNECTED WORK", "bs-mono") + small(pick(lang, "تصور سير العمل", "WORKFLOW CONCEPT"), "bs-pill")) + div("bs-map-core", '<img src="/assets/brand/bowdy-labs-mark.svg" width="64" height="64" alt="">' + text("strong", pick(lang, "طلب واحد.<br>سياق متصل.", "One request.<br>Connected context.").replaceAll("<br>", " "))) +
      div("bs-map-nodes", businessSystems.map((s, i) => el("a", { href: route(lang, s.slug), "data-accent": s.accent }, systemIcon(s.symbol) + div("", small("0" + (i + 1), "bs-mono") + text("strong", s[lang].name)) + arrow())).join("")) + p(pick(lang, "يمكن تنفيذ كل مسار منفردًا، ثم توسيعه حسب النطاق.", "Each workflow can start independently and expand within scope."), "bs-fineprint"))));
  const systems = el("section", { class: "section-pad bs-catalog", id: "business-systems" }, div("container", sectionHead(pick(lang, "أربع بدايات عملية", "FOUR PRACTICAL STARTING POINTS"), pick(lang, "اختر ما يحتاجه فريقك اليوم.", "Choose what your team needs today.")) + renderSystemsCards(lang)));
  const core = el("section", { class: "section-pad bs-core" }, div("container", sectionHead(pick(lang, "قدرات باودي الأخرى", "MORE BOWDY CAPABILITIES"), pick(lang, "الهندسة والأمان والنمو حول مشروعك.", "Engineering, security and growth around your project."), pick(lang, "باودي لابز شركة ذكاء اصطناعي سعودية تقدم هذه الخدمات بصورة مستقلة أو ضمن مشروع محدد الاعتماديات.", "Commission these capabilities independently or within a scoped project.")) + div("bs-core-grid", services.map(s => el("article", { id: s.slug }, text("h3", lang === "en" ? s.titleEn : s.title) + p(serviceCopy[s.slug][lang][0]) + link(route(lang, s.slug), pick(lang, "تفاصيل المسار", "Explore the capability"), "bs-card-link"))).join(""))));
  return div("bs-site", hero + systems + renderPlanner(lang) + delivery(lang) + governance(lang) + core);
}
