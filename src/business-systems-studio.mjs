import { businessSystems } from "./business-systems-content.mjs";

const e = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const pick = (lang, ar, en) => lang === "en" ? en : ar;
const span = (copy, cls = "") => `<span class="${cls}">${e(copy)}</span>`;
const div = (cls, body, attrs = "") => `<div class="${cls}" ${attrs}>${body}</div>`;
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
const keys = ["chat", "crm", "booking", "dashboard"];
const shortNames = { ar: ["محادثة", "CRM", "حجز", "لوحة إدارة"], en: ["Chat", "CRM", "Booking", "Dashboard"] };

function sampleScene(key, lang) {
  const t = (ar, en) => pick(lang, ar, en);
  if (key === "chat") return div("bs-art-chat",
    div("bs-art-person", '<img src="/assets/media/agents/rudd-96.webp" width="36" height="36" alt="">' + div("", `<strong>${t("رُدّ", "Rudd")}</strong>` + span(t("مساعد العملاء", "Customer assistant")))) +
    div("bs-art-bubble bs-art-user", t("أحتاج زيارة استشارية. من أين أبدأ؟", "I need a consultation. Where do I start?")) +
    div("bs-art-bubble", t("أهلًا بك. نبدأ بتحديد الخدمة، ثم نرتب خطوة المتابعة مع الفريق.", "Welcome. Let’s choose the service, then prepare the next step with the team.")) +
    div("bs-art-context", '<i></i>' + span(t("سياق جاهز للمتابعة", "Context ready for follow-up")) + span("REQ–104", "bs-mono")));
  if (key === "crm") return div("bs-art-board", [
    [t("وارد", "Inbox"), t("طلب جديد", "New enquiry")],
    [t("متابعة", "Follow-up"), t("زيارة استشارية", "Consultation visit")],
    [t("الخطوة التالية", "Next step"), t("تحديد الموعد", "Choose a time")],
  ].map(([title, value], i) => div("bs-art-column", span(title, "bs-art-column-name") + (i === 1
    ? div("bs-art-lead", span("REQ–104", "bs-mono") + `<strong>${e(value)}</strong>` + div("bs-art-skeleton", "<i></i><i></i>") + div("bs-art-owner", span(t("م", "M"), "bs-art-avatar") + span(t("مها · المتابعة", "Maya · follow-up"))))
    : div("bs-art-placeholder", span(value) + '<i></i><i></i>')))).join(""));
  if (key === "booking") return div("bs-art-booking",
    div("bs-art-calendar-top", `<strong>${t("يوم العرض التجريبي", "Sample booking day")}</strong>` + span(t("مقدم خدمة واحد", "One provider"))) +
    div("bs-art-days", ["01", "02", "03", "04", "05"].map((n, i) => span(n, i === 2 ? "is-chosen" : "")).join("")) +
    div("bs-art-appointment", span("10:30", "bs-art-time") + div("", span("REQ–104", "bs-mono") + `<strong>${t("زيارة استشارية", "Consultation visit")}</strong>` + span(t("وقت واحد · دون تعارض", "One slot · no conflict"))) + span(t("مؤكد في المثال", "Confirmed in example"), "bs-art-confirmed")) +
    div("bs-art-hours", span("09:00") + "<i></i>" + span("12:00")));
  return div("bs-art-dashboard",
    div("bs-art-metrics", [["01", t("طلب وارد", "Enquiry")], ["01", t("موعد منظم", "Appointment")], ["00", t("دون مسؤول", "Unassigned")]].map(([n, label]) => div("", `<strong>${n}</strong>` + span(label))).join("")) +
    div("bs-art-report", div("", span(t("رحلة الطلب", "Request journey")) + span(t("بيانات المثال", "Example data"), "bs-art-report-note")) + '<svg viewBox="0 0 440 90" fill="none" aria-hidden="true"><path d="M0 75H440M0 40H440M0 5H440" stroke="currentColor" opacity=".1"/><path d="M5 70C40 70 45 53 80 53S120 67 155 42 200 51 238 29 290 44 320 20 380 25 435 6" stroke="currentColor" stroke-width="3"/><circle cx="435" cy="6" r="5" fill="currentColor"/></svg>') +
    div("bs-art-context", "<i></i>" + span(t("الطلب والموعد في نفس السياق", "Request and appointment, connected"))));
}

export function renderCardArt(service, lang) {
  return div("bs-card-art", sampleScene(service.key, lang), 'aria-hidden="true"');
}

export function renderStudioHero(lang, icon) {
  const t = (ar, en) => pick(lang, ar, en);
  const short = shortNames[lang];
  const titles = t(
    ["من سؤال، إلى خطوة واضحة.", "المتابعة تعرف صاحبها.", "موعد يعرفه العميل والفريق.", "الصورة مكتملة أمام الإدارة."],
    ["A question. A useful next step.", "A follow-up with an owner.", "A time your whole team can see.", "The context behind the numbers."]);
  const notes = t(
    ["توضيح الخدمة وتجهيز السياق للتحويل.", "سجل واحد يجمع الطلب والمسؤول والإجراء.", "تأكيد الموعد وفق التوفر وقواعد الخدمة.", "متابعة الحالة والمصدر والخطوة التالية."],
    ["Explain the service and prepare a useful handover.", "One record connects the enquiry, owner and action.", "Confirm a time around availability and service rules.", "Follow status, source and next action."]);
  const panels = keys.map((key, i) => {
    const s = businessSystems.find(s => s.key === key);
    return `<section class="bs-studio-panel" id="studio-panel-${key}" data-studio-panel="${key}" data-accent="${s.accent}" aria-labelledby="studio-title-${key}"${i ? " hidden" : ""}>` +
      div("bs-studio-scene-title", span("0" + (i + 1), "bs-mono") + `<h2 id="studio-title-${key}">${e(titles[i])}</h2>`) +
      div("bs-studio-screen", sampleScene(key, lang)) + `<p class="bs-studio-caption">${e(notes[i])}</p></section>`;
  }).join("");
  const stage = div("bs-studio", div("bs-studio-chrome", div("bs-studio-wordmark", '<img src="/assets/brand/bowdy-labs-mark.svg" width="28" height="28" alt="">' + span("BOWDY / WORKSPACE", "bs-mono")) + span(t("تصور توضيحي", "WORKFLOW CONCEPT"), "bs-studio-mode")) +
    div("bs-studio-tabs", keys.map((key, i) => { const s = businessSystems.find(s => s.key === key); return `<button type="button" data-studio-select="${key}" aria-pressed="${i === 0}" aria-controls="studio-panel-${key}" data-accent="${s.accent}">${icon(s.symbol)}${span(short[i])}</button>`; }).join(""), `role="group" aria-label="${t("مراحل رحلة الطلب التوضيحية", "Illustrative request journey stages")}"`) +
    div("bs-studio-panels", panels) +
    div("bs-studio-footer", div("bs-studio-progress", span("01 / 04", "bs-mono") + div("bs-studio-progress-track", "<i></i>")) + `<button type="button" class="bs-studio-next" data-studio-next>${span(t("الخطوة التالية", "Next step"))}${arrow}</button>`) +
    `<p class="bs-studio-disclosure">${t("طلب تجريبي واحد · لا إرسال أو حجز فعلي", "One synthetic enquiry · no real messages or bookings")}</p><span class="bs-sr-only" data-studio-status role="status" aria-live="polite"></span>`, 'data-workflow-studio data-current="chat"');
  return `<section class="bs-studio-hero"><div class="container">` +
    div("bs-studio-edition", span("BOWDY BUSINESS SYSTEMS", "bs-mono") + "<i></i>" + span(t("صُممت حول طريقة عملك", "BUILT AROUND YOUR WORK"))) +
    div("bs-studio-hero-grid", div("bs-studio-intro", span(t("أنظمة الأعمال · من الرياض", "BUSINESS SYSTEMS · RIYADH"), "bs-kicker") + `<h1>${t("كل طلب.<br><em>له مسار.</em>", "Every request.<br><em>A clear path.</em>")}</h1>` +
      `<p class="bs-studio-lead">${t("عميل يسأل. فريق يتابع. موعد يتأكد.<br>وإدارة ترى الصورة كاملة.", "A customer asks. A team follows up.<br>A booking is confirmed. The picture comes together.")}</p>` +
      `<p class="bs-studio-summary">${t("نبني أنظمة CRM ولوحات التحكم والحجز والشات بوت، حول التفاصيل التي تجعل العمل يمشي.", "CRM, dashboards, booking and chatbots. Built around the details that keep your work moving.")}</p>` +
      div("bs-hero-actions", `<a class="bs-button" href="#business-systems">${t("اكتشف نظامك القادم", "Explore your next system")}${arrow}</a><a class="bs-button bs-button-outline" href="#scope-builder">${t("خلّنا نرتب فكرتك", "Let’s shape your workflow")}${arrow}</a>`) +
      div("bs-studio-promise", "<i></i>" + span(t("خدمات مستقلة. تتصل عندما يحتاج العمل.", "Independent services. Connected when work needs it.")))) + stage) +
    div("bs-studio-index", businessSystems.map((s, i) => `<a href="${lang === "en" ? "/en" : ""}/services/${s.slug}/" data-accent="${s.accent}">${span("0" + (i + 1), "bs-mono")}${icon(s.symbol)}${span(t(["عملاؤك، بخطوة تالية", "قراراتك، بصورة أوضح", "مواعيدك، بترتيب واحد", "محادثاتك، بخطوة مفيدة"][i], ["Customers, followed through", "Decisions, with context", "Appointments, organized", "Conversations, with purpose"][i]))}${arrow}</a>`).join("")) +
    "</div></section>";
}

const changes = {
  crm: {
    ar: ["من محادثات متفرقة، إلى متابعة مفهومة.", ["الطلب داخل محادثة", "المسؤول غير واضح", "متابعة تنتظر التذكير"], ["طلب في سجل موحد", "مسؤول عن الخطوة التالية", "موعد وحالة للمتابعة"]],
    en: ["From scattered conversations to a clear follow-up.", ["An enquiry in a chat", "Unclear ownership", "A follow-up to remember"], ["A shared enquiry record", "An owner for the next step", "A follow-up date and status"]],
  },
  dashboard: {
    ar: ["من جمع الأرقام، إلى فهم ما يحتاج إجراءً.", ["تقارير في ملفات مختلفة", "رقم بلا مصدر واضح", "موافقة تتأخر بين الرسائل"], ["المؤشرات في سياق واحد", "مصدر وتوقيت تحديث معروفان", "إجراء بصلاحية ومسؤول"]],
    en: ["From assembling numbers to knowing what needs action.", ["Reports in separate files", "A number without a source", "An approval lost in messages"], ["Metrics with shared context", "A known source and refresh time", "An authorized action and owner"]],
  },
  booking: {
    ar: ["من أكثر من نسخة للجدول، إلى موعد واضح.", ["وقت متداول في المحادثات", "تعديل لا يصل إلى الجميع", "حجز يصطدم بموعد آخر"], ["توفر مرتبط بالخدمة", "حالة موعد يعرفها الفريق", "قواعد تمنع التعارض"]],
    en: ["From competing calendars to one clear appointment.", ["A time buried in messages", "A change the team misses", "Two bookings for one slot"], ["Service-aware availability", "An appointment state the team sees", "Rules that prevent conflicts"]],
  },
  chat: {
    ar: ["من سؤال يتكرر، إلى محادثة تعرف حدودها.", ["نفس الأسئلة كل يوم", "إجابة لا يصل معها السياق", "طلب تحويل دون ملخص"], ["إجابات من معرفة محددة", "خطوة مفيدة بعد الاستفسار", "تحويل بشري بملخص واضح"]],
    en: ["From repeated questions to a conversation with boundaries.", ["The same questions again", "A reply without context", "A handover without a summary"], ["Answers from defined knowledge", "A useful next step", "A human handover with context"]],
  },
  hub: {
    ar: ["الفرق يظهر في تفاصيل يومك.", ["الطلب في محادثة", "الموعد في جدول آخر", "التقرير يحتاج جمعًا يدويًا"], ["سياق يسافر مع الطلب", "مسؤول وموعد وخطوة تالية", "صورة أوضح لما يحتاج إجراءً"]],
    en: ["The difference is in the details of your day.", ["The enquiry lives in a chat", "The booking lives elsewhere", "The report needs rebuilding"], ["Context travels with the request", "An owner, a time and a next step", "A clearer view of what needs action"]],
  },
};

export function renderComparison(lang, key = "hub") {
  const [title, before, after] = changes[key][lang];
  const t = (ar, en) => pick(lang, ar, en);
  return `<section class="bs-change section-pad"><div class="container bs-change-layout">` +
    div("bs-change-intro", span(t("تخيّل يوم عملك", "IMAGINE YOUR WORKDAY"), "bs-kicker") + `<h2>${e(title)}</h2><p>${t("تصور لطريقة تنظيم العمل. نحدد ما يناسب فريقك بعد مراجعة خطواته وأدواته.", "An illustration of an organized workflow. The right implementation follows a review of your team’s process and tools.")}</p>` + div("bs-change-mark", '<img src="/assets/brand/bowdy-labs-mark.svg" width="44" height="44" alt="">' + span("LESS FRICTION. MORE FLOW."))) +
    div("bs-change-canvas", div("bs-change-before", span(t("عندما تتفرق التفاصيل", "WHEN CONTEXT GETS SCATTERED"), "bs-change-label") + div("bs-change-notes", before.map((v, i) => div("bs-change-note", span("0" + (i + 1), "bs-mono") + `<strong>${e(v)}</strong>`)).join(""))) +
      div("bs-change-divider", arrow) + div("bs-change-after", span(t("عندما يتضح المسار", "WHEN THE PATH BECOMES CLEAR"), "bs-change-label") + after.map((v, i) => div("bs-change-row", span("0" + (i + 1), "bs-mono") + `<strong>${e(v)}</strong><i></i>`)).join(""))) +
    "</div></section>";
}

export function renderSystemRail(service, lang, icon) {
  return div("bs-system-rail container", businessSystems.map((s, i) => `<a href="${lang === "en" ? "/en" : ""}/services/${s.slug}/" data-accent="${s.accent}"${s.key === service.key ? ' aria-current="page"' : ""}>${span("0" + (i + 1), "bs-mono")}${icon(s.symbol)}${span(pick(lang, ["إدارة العملاء", "لوحات الإدارة", "الحجز والمواعيد", "الشات بوت"][i], ["CRM", "Dashboards", "Booking", "Chatbots"][i]))}${s.key === service.key ? '<i></i>' : ""}</a>`).join(""));
}
