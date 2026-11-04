(() => {
  "use strict";
  const section = document.querySelector("[data-trial-section]");
  const form = document.querySelector("[data-trial-form]");
  const params = new URLSearchParams(window.location.search);
  if (!section || !form || params.get("intent") !== "trial") return;
  section.hidden = false;
  const standardContact = document.querySelector("[data-standard-contact]");
  if (standardContact) standardContact.hidden = true;
  const en = document.documentElement.lang === "en";
  const allowedPlans = new Set(["launch", "build", "scale"]);
  const plan = allowedPlans.has(params.get("plan")) ? params.get("plan") : "unspecified";
  const normalisePhone = value => String(value).trim()
    .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x6f0))
    .replace(/[\s().-]/g, "");
  for (const field of [form.elements.phone, form.elements.businessWhatsapp]) {
    field.addEventListener("input", () => field.setCustomValidity(""));
  }
  if (window.location.hash === "#trial") requestAnimationFrame(() => section.scrollIntoView({ block: "start" }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    for (const field of [form.elements.phone, form.elements.businessWhatsapp]) {
      const valid = /^\+?[0-9]{8,15}$/.test(normalisePhone(field.value));
      field.setCustomValidity(valid ? "" : en ? "Enter a valid phone number (8–15 digits)." : "أدخل رقم هاتف صحيحًا من 8 إلى 15 رقمًا.");
    }
    if (!form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const task = form.elements.task.value.trim();
    if (!name || task.length < 12) return;
    const lines = en ? ["Hello BOWDY LABS — free agent trial request", `Name: ${name}`, `Mobile: ${normalisePhone(form.elements.phone.value)}`, `Business WhatsApp: ${normalisePhone(form.elements.businessWhatsapp.value)}`, `Plan: ${plan}`, "Job:", task, "Please confirm trial suitability, timing and data handling before starting."] : ["مرحبًا باودي لابز — طلب تجربة وكيل مجانية", `الاسم: ${name}`, `الجوال: ${normalisePhone(form.elements.phone.value)}`, `واتساب النشاط: ${normalisePhone(form.elements.businessWhatsapp.value)}`, `الباقة: ${plan}`, "المهمة:", task, "أرجو تأكيد ملاءمة التجربة وموعدها وطريقة التعامل مع بياناتها قبل البدء."];
    const url = `https://wa.me/966598447530?text=${encodeURIComponent(lines.join("\n"))}`;
    const fallback = form.querySelector("[data-trial-fallback]");
    fallback.href = url;
    fallback.hidden = false;
    form.querySelector(".form-status").textContent = en ? "Your request is ready. Review and send it in WhatsApp. If it did not open, use the link below." : "طلبك جاهز. راجعه وأرسله في واتساب. إذا لم يُفتح، استخدم الرابط بالأسفل.";
    // This is an explicit handoff, not proof that a message was delivered.
    const data = { page: en ? "/en/contact/" : "/contact/", language: en ? "en" : "ar", service: "ai-agents", plan, delivery: "whatsapp_handoff" };
    try { window.va?.("event", { name: "trial_request", data }); } catch { /* Measurement must not block contact. */ }
    window.dispatchEvent(new CustomEvent("bowdy:analytics", { detail: { name: "trial_request", data } }));
    window.open(url, "_blank", "noopener,noreferrer");
  });
})();
