import { crmTransition, bookingTransition, dashboardTransition, makePlan, contactPlan, serviceSlugs } from "./business-systems-model.js?v=20261113-2";

const isEn = document.documentElement.lang === "en";
const choose = (ar, en) => isEn ? en : ar;
const keys = Object.keys(serviceSlugs);
const names = {
  ar: ["أنظمة CRM وإدارة العملاء", "لوحات الإدارة والمؤشرات", "أنظمة الحجز والمواعيد", "الشات بوت ومساعدو العملاء"],
  en: ["CRM & customer systems", "Dashboards & admin panels", "Booking & appointment systems", "Chatbots & customer assistants"],
};
function track(action, service) {
  const data = { service, action, language: isEn ? "en" : "ar", context: "synthetic_demo" };
  try { if (typeof window.va === "function") window.va("event", { name: "business_system_interaction", data }); } catch { /* Navigation and demos do not depend on analytics. */ }
  window.dispatchEvent(new CustomEvent("bowdy:analytics", { detail: { name: "business_system_interaction", data } }));
}

document.querySelectorAll("[data-workflow-studio]").forEach(root => {
  const order = ["chat", "crm", "booking", "dashboard"];
  const controls = Array.from(root.querySelectorAll("[data-studio-select]"));
  let current = 0;
  const show = (index, focus = false) => {
    current = (index + order.length) % order.length;
    const key = order[current];
    root.dataset.current = key;
    controls.forEach((control, i) => control.setAttribute("aria-pressed", String(i === current)));
    root.querySelectorAll("[data-studio-panel]").forEach(panel => { panel.hidden = panel.dataset.studioPanel !== key; });
    root.querySelector(".bs-studio-progress>.bs-mono").textContent = "0" + (current + 1) + " / 04";
    root.querySelector("[data-studio-status]").textContent = root.querySelector("#studio-title-" + key).textContent;
    if (focus) controls[current].focus();
    track("journey_" + key, serviceSlugs[key]);
  };
  root.addEventListener("click", event => {
    const select = event.target.closest("[data-studio-select]");
    if (select && root.contains(select)) show(order.indexOf(select.dataset.studioSelect));
    else if (event.target.closest("[data-studio-next]")) show(current + 1);
  });
  root.querySelector(".bs-studio-tabs").addEventListener("keydown", event => {
    const selected = event.target.closest("[data-studio-select]");
    if (!selected || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = controls.indexOf(selected);
    const delta = document.documentElement.dir === "rtl" ? -1 : 1;
    show(event.key === "Home" ? 0 : event.key === "End" ? 3 : index + (event.key === "ArrowRight" ? delta : -delta), true);
  });
});

const messages = {
  crm: {
    ready: ["اختر إجراءً لتجربة المسار.", "Choose an action to explore the workflow."],
    assigned: ["أُسند الطلب إلى مها، وأصبح مسؤول المتابعة واضحًا.", "The request is assigned to Maya, with a clear follow-up owner."],
    scheduled: ["حُددت متابعة تجريبية. انتقل السجل مع المسؤول والخطوة التالية.", "A sample follow-up is set. Ownership and next action stay on the record."],
    "needs-owner": ["ابدأ بإسناد الطلب، ثم حدّد المتابعة.", "Assign an owner first, then set the follow-up."],
    duplicate: ["تعرف النموذج على الطلب المكرر. بقي سجل واحد دون إنشاء متابعة ثانية.", "The repeated enquiry matched the same record. No second record or follow-up was created."],
  },
  booking: {
    ready: ["اختر وقتًا ثم جرّب التأكيد أو التعارض.", "Choose a time, then explore confirmation or a conflict."],
    selected: ["وقت مختار داخل النموذج. أكّد الموعد لتحديث حالته.", "A sample time is selected. Confirm it to update the appointment."],
    confirmed: ["تأكد الموعد داخل النموذج وظهر في جدول الفريق التجريبي.", "The sample appointment is confirmed and visible to the example team."],
    rescheduled: ["تحدّث الموعد وحالة التذكير التجريبية إلى الوقت الجديد.", "The appointment and sample reminder state now use the new time."],
    conflict: ["الوقت محجوز بالفعل في النموذج. لم يُنشأ موعد ثانٍ متعارض.", "That time is already booked in this example. No conflicting appointment was created."],
    "choose-new": ["اختر وقتًا آخر ثم اضغط أكّد الموعد.", "Choose a different time, then confirm it."],
    "needs-booking": ["أكّد موعدًا أولًا، ثم جرّب التعديل أو التعارض.", "Confirm an appointment first, then try a change or conflict."],
  },
  dashboard: {
    ready: ["جرّب الفرع والدور، ثم اختبر توقف المصدر أو اعتماد الطلب.", "Try a location and role, then explore source failure or approval."],
    filtered: ["تحدثت المؤشرات من مجموعة البيانات التجريبية نفسها.", "Metrics now reflect the selected synthetic dataset."],
    role: ["تغير دور العرض داخل المحاكاة. الصلاحيات الفعلية تُنفذ وتُختبر في النظام الخلفي.", "The simulated role changed. Real access controls are implemented and tested on the backend."],
    stale: ["المصدر التجريبي متوقف. تُعرض آخر نسخة مع حالة واضحة؛ البيانات المفقودة ليست صفرًا.", "The simulated source is offline. The last snapshot remains visible with its status; missing data is not zero."],
    restored: ["عاد المصدر التجريبي، وحالة البيانات متاحة مجددًا.", "The simulated source is available again."],
    restricted: ["يتطلب الاعتماد دور مدير في المحاكاة. لم تتغير حالة الطلب.", "Approval requires the simulated manager role. The request is unchanged."],
    approved: ["اعتمد المدير الطلب في المحاكاة، وظهر الإجراء في سجل النموذج.", "The simulated manager approved the request and the example records the action."],
  },
};

document.querySelectorAll("[data-business-demo]").forEach(root => {
  const key = root.dataset.businessDemo;
  const initial = () => key === "crm"
    ? { assigned: false, followup: false, count: 1, notice: "ready" }
    : key === "booking"
      ? { booked: null, selected: "09:00", editing: false, notice: "ready" }
      : { branch: "all", role: "staff", stale: false, approved: false, notice: "ready" };
  let state = initial();
  const status = root.querySelector("[data-demo-status]");
  function render() {
    if (key === "crm") {
      const stage = state.followup ? 2 : state.assigned ? 1 : 0;
      root.querySelector("[data-crm-owner]").textContent = state.assigned ? choose("مها · المبيعات", "Maya · sales") : choose("غير مسند", "Unassigned");
      root.querySelector("[data-crm-next]").textContent = state.followup ? choose("متابعة مجدولة", "Follow-up set") : choose("تحديد متابعة", "Set follow-up");
      const columns = root.querySelectorAll("[data-crm-column]");
      columns.forEach((column, index) => column.classList.toggle("is-active", index === stage));
      root.querySelectorAll("[data-crm-step]").forEach((step, index) => step.classList.toggle("is-active", index <= stage));
      columns[stage].append(root.querySelector("[data-crm-card]"));
      root.querySelectorAll(".bs-stage-empty").forEach(empty => { empty.hidden = empty.parentElement.classList.contains("is-active"); });
    } else if (key === "booking") {
      root.querySelectorAll('input[name="demo-time"]').forEach(input => { input.checked = input.value === state.selected; });
      root.querySelector("[data-booking-summary]").textContent = state.booked
        ? choose("موعد مؤكد: ", "Confirmed time: ") + state.booked + (state.editing ? choose(" · بانتظار التعديل", " · change pending") : "")
        : choose("اختر وقتًا ثم أكّد الحجز", "Choose a time, then confirm");
      root.querySelector(".bs-booking-ticket").classList.toggle("is-confirmed", !!state.booked);
    } else if (key === "dashboard") {
      const values = { all: [12, 9, 3], main: [8, 6, 2], north: [4, 3, 1] }[state.branch];
      ["requests", "followups", "waiting"].forEach((name, i) => { root.querySelector('[data-stat="' + name + '"]').textContent = values[i]; });
      root.querySelector("[data-dashboard-branch]").value = state.branch;
      root.querySelector("[data-dashboard-role]").value = state.role;
      root.querySelector("[data-source-status]").textContent = state.stale
        ? choose("المصدر غير متصل · آخر نسخة تجريبية محفوظة", "Source offline · last sample snapshot")
        : choose("المصدر متاح · بيانات النموذج التجريبية", "Source available · synthetic example data");
      root.querySelector(".bs-source").textContent = state.stale ? choose("غير متصل", "Offline") : choose("متاح", "Available");
      root.querySelector(".bs-chart").classList.toggle("is-stale", state.stale);
      root.querySelector(".bs-approval-row").classList.toggle("is-approved", state.approved);
      root.querySelector("[data-approval-label]").textContent = state.approved ? choose("طلب معتمد داخل النموذج", "Approved in this example") : choose("طلب يحتاج اعتمادًا", "Request awaiting approval");
      root.querySelector('[data-action="approve"]').disabled = state.approved;
    }
    if (key !== "chat") status.textContent = messages[key][state.notice]?.[isEn ? 1 : 0] || "";
  }
  root.addEventListener("change", event => {
    if (key === "booking" && event.target.matches('input[name="demo-time"]')) state = bookingTransition(state, "select", event.target.value);
    if (key === "dashboard" && event.target.matches("[data-dashboard-branch]")) state = dashboardTransition(state, "branch", event.target.value);
    if (key === "dashboard" && event.target.matches("[data-dashboard-role]")) state = dashboardTransition(state, "role", event.target.value);
    render();
  });
  root.addEventListener("click", event => {
    const control = event.target.closest("[data-action]");
    if (!control || !root.contains(control)) return;
    const action = control.dataset.action;
    if (action === "reset") state = initial();
    else if (key === "crm") state = crmTransition(state, action);
    else if (key === "booking") state = bookingTransition(state, action);
    else if (key === "dashboard") state = dashboardTransition(state, action);
    if (key === "chat") renderChat(action);
    else render();
    track(action, serviceSlugs[key]);
  });
  function renderChat(action) {
    const log = root.querySelector("[data-chat-messages]");
    const record = root.querySelector("[data-chat-record]");
    const responses = {
      help: [choose("ما خدماتكم؟", "What services do you offer?"), choose("نوضح في هذا المثال خدمات استشارية وزيارات بمواعيد. نقدر ننظم طلبك أو نحوله للفريق.", "This example offers consultations and scheduled visits. We can prepare your request or hand it to the team.")],
      booking: [choose("أريد حجز زيارة.", "I need an appointment."), choose("الخطوة التالية اختيار الخدمة والوقت المتاح. هذه محاكاة للرحلة؛ لن يُنشأ حجز حقيقي هنا.", "The next step is selecting a service and available time. This simulates the journey; no real booking is created here.")],
      unknown: [choose("هل تقدمون خدمة غير موجودة في المعرفة؟", "Do you offer a service outside the knowledge base?"), choose("هذه المعلومة غير متاحة في المعرفة التجريبية. يمكن تحويل الاستفسار لفريق بشري مع ملخص واضح.", "That information is outside this example's knowledge. The enquiry can be handed to a person with a useful summary.")],
      handoff: [choose("حوّل استفساري للفريق.", "Hand my enquiry to the team."), choose("ظهر سجل تحويل توضيحي مع الملخص وسبب التحويل والخطوة التالية. لم يُرسل طلب لفريق حقيقي.", "A sample handover record now includes the summary, reason and next action. No request was sent to a real team.")],
      reset: ["", choose("أهلًا بك. اختر استفسارًا لترى كيف تصل المحادثة إلى خطوة واضحة.", "Welcome. Choose an enquiry to explore a conversation with a useful next step.")],
    };
    const response = responses[action];
    if (!response) return;
    log.replaceChildren();
    response.forEach((copy, i) => {
      if (!copy) return;
      const bubble = document.createElement("div");
      bubble.className = "bs-chat-bubble " + (i ? "bs-chat-agent" : "bs-chat-user");
      bubble.textContent = copy;
      log.append(bubble);
    });
    record.hidden = action !== "handoff";
    status.textContent = action === "handoff" ? choose("تحويل تجريبي فقط؛ لا إرسال خارجي.", "Simulated handover only; nothing sent externally.") : choose("محادثة باختيارات محددة لشرح النطاق.", "Preset choices illustrating the workflow.");
  }
});

function planText(plan, ui, labels) {
  const i = keys.indexOf(plan.problem);
  return [
    choose("ملخص احتياج مبدئي · باودي لابز", "Initial requirements brief · BOWDY LABS"),
    labels[i], "",
    ui.toolsLabel + ": " + ui.tools[["sheets", "platform", "several"].indexOf(plan.tools)],
    ui.first + ": " + ui.scopes[i],
    ui.route + ": " + ui.paths[["sheets", "platform", "several"].indexOf(plan.tools)],
    ui.acceptance + ": " + ui.checks[i],
    ui.approval + ": " + ui.controls[plan.approval === "yes" ? 0 : 1],
    "", ui.planNote,
  ].join("\n");
}

document.querySelectorAll("[data-business-planner]").forEach(root => {
  const { ui, names: labels } = JSON.parse(root.querySelector("[data-plan-copy]").textContent);
  const problem = root.querySelector("[data-plan-problem]");
  const tools = root.querySelector("[data-plan-tools]");
  const approval = root.querySelector("[data-plan-approval]");
  const current = () => makePlan(problem.value, tools.value, approval.value);
  function update() {
    const plan = current(), i = keys.indexOf(plan.problem);
    root.querySelector("[data-plan-title]").textContent = labels[i];
    root.querySelector("[data-plan-route]").textContent = ui.paths[["sheets", "platform", "several"].indexOf(plan.tools)];
    root.querySelector("[data-plan-scope]").textContent = ui.scopes[i];
    root.querySelector("[data-plan-check]").textContent = ui.checks[i];
    root.querySelector("[data-plan-control]").textContent = ui.controls[plan.approval === "yes" ? 0 : 1];
    const params = new URLSearchParams({ service: plan.service, tools: plan.tools, approval: plan.approval });
    root.querySelector("[data-plan-contact]").href = (isEn ? "/en" : "") + "/contact/?" + params + "#project-brief";
  }
  root.addEventListener("change", () => { update(); track("scope_changed", current().service); });
  root.querySelector("[data-plan-download]").addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob(["\uFEFF", planText(current(), ui, labels)], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "Bowdy-Requirements-" + current().problem + ".txt";
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    track("brief_saved", current().service);
  });
  update();
});

// Only allowlisted, non-personal planning choices are carried in the URL.
const form = document.querySelector("[data-contact-form], [data-contact-form-en]");
const plan = contactPlan(window.location.search);
if (form && plan) {
  form.id = "project-brief";
  form.elements.service.value = plan.service;
  const copy = document.querySelector("[data-contact-plan-copy]");
  if (copy && form.elements.goal && !form.elements.goal.value.trim()) {
    const ui = JSON.parse(copy.textContent);
    form.elements.goal.value = planText(plan, ui, names[isEn ? "en" : "ar"]);
    const note = document.createElement("p");
    note.className = "bs-contact-note";
    note.textContent = choose("نقلنا اختيارات نطاقك هنا. عدّل الملخص ثم راجع الرسالة وأرسلها بنفسك في واتساب.", "Your planning choices are ready here. Edit the brief, then review and send it yourself in WhatsApp.");
    form.prepend(note);
  }
}
