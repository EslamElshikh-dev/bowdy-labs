(() => {
  "use strict";
  const { phone, whatsapp } = document.currentScript.dataset;
  const tagId = phone.split("/")[0];
  const en = document.documentElement.lang.startsWith("en");
  const key = "bowdy.ads-measurement";
  let choice;
  try { choice = localStorage.getItem(key); } catch { /* A choice can still last for this page. */ }

  const banner = document.createElement("section");
  banner.className = "ads-consent";
  banner.setAttribute("aria-label", en ? "Ad measurement preferences" : "تفضيلات قياس الإعلانات");
  const copy = document.createElement("span");
  copy.textContent = en
    ? "May we use Google Ads cookies to measure clicks on our call and WhatsApp buttons?"
    : "هل تسمح باستخدام ملفات ارتباط Google Ads لقياس نقرات الاتصال وواتساب؟";
  const footer = document.querySelector(".footer-legal");
  function button(label, action) {
    const control = document.createElement("button");
    control.type = "button";
    control.textContent = label;
    control.addEventListener("click", action);
    return control;
  }

  let loaded = false;
  function tag() { window.dataLayer.push(arguments); }
  function consent(allowed) {
    return {
      ad_storage: allowed ? "granted" : "denied",
      ad_user_data: allowed ? "granted" : "denied",
      analytics_storage: "denied",
      ad_personalization: "denied",
    };
  }
  function start() {
    if (loaded) {
      tag("consent", "update", consent(true));
      return;
    }
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    tag("consent", "default", consent(false));
    tag("consent", "update", consent(true));
    tag("js", new Date());
    tag("config", tagId, {
      send_page_view: false, allow_ad_personalization_signals: false, allow_enhanced_conversions: false,
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(tagId);
    document.head.append(script);
  }
  function choose(allowed) {
    choice = allowed ? "granted" : "denied";
    try { localStorage.setItem(key, choice); } catch { /* Retain the in-memory choice. */ }
    if (allowed) start();
    else if (loaded) tag("consent", "update", consent(false));
    banner.hidden = true;
    if (reopened) preferences.focus();
  }
  const accept = button(en ? "Allow" : "أسمح", () => choose(true));
  const decline = button(en ? "Decline" : "أرفض", () => choose(false));
  const policy = document.createElement("a");
  policy.href = en ? "/en/privacy/" : "/privacy/";
  policy.textContent = en ? "Privacy" : "الخصوصية";
  banner.append(copy, accept, decline, policy);
  let reopened = false;
  const preferences = button(en ? "Ad measurement" : "قياس الإعلانات", () => {
    reopened = true;
    banner.hidden = false;
    accept.focus();
  });
  preferences.className = "ads-preferences";
  footer?.append(preferences);
  banner.hidden = choice === "granted" || choice === "denied";
  const header = document.querySelector(".site-header");
  if (header) header.after(banner);
  else document.body.prepend(banner);
  if (choice === "granted") start();

  window.addEventListener("bowdy:contact-click", ({ detail }) => {
    if (choice !== "granted" || !["phone", "whatsapp"].includes(detail?.channel)) return;
    tag("event", "conversion", {
      send_to: detail.channel === "phone" ? phone : whatsapp,
      transaction_id: detail.id,
    });
  });
})();
