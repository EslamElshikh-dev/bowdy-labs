(() => {
  "use strict";

  const page = window.location.pathname.replace(/index\.html$/, "") || "/";
  const language = document.documentElement.lang || "ar";
  const form = document.querySelector("[data-contact-form], [data-contact-form-en]");
  const params = new URLSearchParams(window.location.search);
  const services = ["crm-development", "business-dashboards", "booking-systems", "ai-chatbots",
    "cybersecurity", "cloud-solutions", "ai-agents", "web-development", "google-support",
    "google-business-profile", "knowledge-bases", "seo", "digital-advertising"];
  const agents = ["tabiq", "barriz", "rudd", "ammin", "salni", "nammi", "anjiz", "thabbit", "zawwid", "warrini"];
  const validService = value => services.includes(value) ? value : "unspecified";
  const validAgent = value => agents.includes(value) ? value : "none";

  function track(name, data = {}) {
    const payload = { page, language, ...data };
    try {
      if (typeof window.va === "function") window.va("event", { name, data: payload });
    } catch {
      // A blocked analytics provider must not interrupt the contact journey.
    }
    window.dispatchEvent(new CustomEvent("bowdy:analytics", { detail: { name, data: payload } }));
  }

  function contactClick(channel, id) {
    window.dispatchEvent(new CustomEvent("bowdy:contact-click", { detail: { channel, id } }));
  }

  function linkLocation(link) {
    if (link.closest(".hero, .page-hero")) return "hero";
    if (link.closest(".site-header")) return "header";
    if (link.closest(".site-footer")) return "footer";
    if (link.closest(".floating-actions")) return "floating_action";
    if (link.closest(".mobile-bottom-nav")) return "mobile_bottom_nav";
    if (link.closest(".cta-section")) return "cta_section";
    if (link.closest(".service-card, .ai-service-card, .essential-service-card, .service-pillar-card")) return "service_card";
    return "content";
  }

  const requestId = () => typeof crypto.randomUUID === "function" ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
  const recentDirect = new Map();
  let lastBrief;
  function directClick(channel, link) {
    const now = Date.now();
    if (now - (recentDirect.get(channel) ?? -Infinity) < 1200) return;
    recentDirect.set(channel, now);
    track(channel + "_click", { location: linkLocation(link) });
    contactClick(channel, requestId());
  }

  document.addEventListener("click", event => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const url = new URL(link.href, window.location.href);
    if (url.protocol === "tel:" && url.pathname.replace(/\D/g, "") === "966598447530") {
      directClick("phone", link);
    } else if (url.protocol === "https:" && (
      (url.hostname === "wa.me" && /^\/966598447530\/?$/.test(url.pathname)) ||
      (url.hostname === "api.whatsapp.com" && url.searchParams.get("phone") === "966598447530")
    )) {
      if (form?.contains(link) && link.closest(".form-status") && lastBrief) {
        if (!lastBrief.fallbackUsed) track("whatsapp_fallback_click", { location: "project_brief" });
        lastBrief.fallbackUsed = true;
      } else {
        directClick("whatsapp", link);
      }
    } else if (url.origin === window.location.origin && ["/contact/", "/en/contact/"].includes(url.pathname)) {
      if (!link.matches(".language-link")) track("project_cta_click", {
        location: linkLocation(link), service: validService(url.searchParams.get("service")), agent: validAgent(url.searchParams.get("agent")),
      });
    }
  }, { passive: true });

  if (!form) return;
  const fields = form.elements;
  const context = () => ({ service: validService(fields.service.value), agent: validAgent(params.get("agent")) });
  const signature = () => JSON.stringify([fields.name.value.trim(), fields.service.value, fields.goal.value.trim(), context().agent]);
  let started = false;
  function markStarted() {
    if (started) return;
    started = true;
    track("contact_form_started", context());
  }
  form.addEventListener("input", markStarted, { once: true, passive: true });
  form.addEventListener("change", markStarted, { once: true, passive: true });
  form.addEventListener("bowdy:brief-handoff", () => {
    const key = signature();
    if (lastBrief?.key === key) return;
    lastBrief = { key, id: requestId(), fallbackUsed: false };
    track("contact_brief_completed", context());
    track("whatsapp_handoff_attempt", context());
    contactClick("whatsapp", lastBrief.id);
  });

  if (params.get("intent") === "trial") return;
  const draftKey = "bowdy.contact.language-draft";
  const otherPage = page === "/en/contact/" ? "/contact/" : "/en/contact/";
  const switches = [...document.querySelectorAll("a.language-link")].filter(link => {
    const url = new URL(link.href);
    return url.origin === window.location.origin && url.pathname === otherPage;
  });
  function switchTarget() {
    const url = new URL(otherPage, window.location.origin);
    const service = validService(fields.service.value);
    if (service !== "unspecified") url.searchParams.set("service", service);
    const agent = context().agent;
    if (agent !== "none") url.searchParams.set("agent", agent);
    for (const [key, choices] of [["tools", ["sheets", "platform", "several"]], ["approval", ["yes", "no"]]]) {
      if (choices.includes(params.get(key))) url.searchParams.set(key, params.get(key));
    }
    url.hash = "project-brief";
    return url;
  }
  function updateSwitches() {
    for (const link of switches) link.href = switchTarget().href;
  }
  for (const link of switches) link.addEventListener("click", () => {
    const url = switchTarget();
    link.href = url.href;
    const sameBrief = lastBrief?.key === signature() ? { id: lastBrief.id, fallbackUsed: lastBrief.fallbackUsed } : null;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({
        target: url.pathname + url.search, time: Date.now(),
        name: fields.name.value, service: fields.service.value, goal: fields.goal.value, sameBrief,
      }));
    } catch { /* Service and planning selections still travel in the link. */ }
  });
  function restore() {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        sessionStorage.removeItem(draftKey);
        const saved = JSON.parse(raw);
        if (saved.target === page + window.location.search && Date.now() - saved.time < 10 * 60 * 1000) {
          fields.name.value = saved.name;
          fields.service.value = saved.service;
          fields.goal.value = saved.goal;
          if (saved.sameBrief) lastBrief = { ...saved.sameBrief, key: signature() };
        }
      }
    } catch { /* Blocked or expired tab storage does not affect the form. */ }
    updateSwitches();
  }
  // Run after the localized form and scope planner have applied their defaults.
  if (document.readyState === "complete") restore();
  else document.addEventListener("DOMContentLoaded", restore, { once: true });
  fields.service.addEventListener("change", updateSwitches);
})();
