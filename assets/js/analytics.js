(() => {
  "use strict";

  const page = window.location.pathname.replace(/index\.html$/, "") || "/";
  const language = document.documentElement.lang || "ar";

  const track = (name, data = {}) => {
    const payload = {
      page,
      language,
      ...data,
    };

    try {
      if (typeof window.va === "function") {
        window.va("event", { name, data: payload });
      }
    } catch {
      // Analytics must never interfere with navigation or conversion flows.
    }

    window.dispatchEvent(
      new CustomEvent("bowdy:analytics", {
        detail: { name, data: payload },
      }),
    );
  };

  const linkLocation = (link) => {
    if (link.closest(".hero")) return "hero";
    if (link.closest(".site-header")) return "header";
    if (link.closest(".site-footer")) return "footer";
    if (link.closest(".floating-actions")) return "floating_action";
    if (link.closest(".mobile-bottom-nav")) return "mobile_bottom_nav";
    if (link.closest(".cta-section")) return "cta_section";
    if (link.closest(".service-card, .ai-service-card, .essential-service-card")) return "service_card";
    return "content";
  };

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest?.("a");
      if (!link) return;

      const rawHref = link.getAttribute("href") || "";
      const location = linkLocation(link);

      if (rawHref.startsWith("tel:")) {
        track("phone_click", { location });
        return;
      }

      if (/https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(link.href)) {
        track("whatsapp_click", { location });
        return;
      }

      try {
        const url = new URL(link.href, window.location.href);
        if (url.origin === window.location.origin && url.pathname === "/contact/") {
          track("project_cta_click", {
            location,
            service: url.searchParams.get("service") || "unspecified",
            agent: url.searchParams.get("agent") || "none",
          });
        }
      } catch {
        // Ignore malformed or non-navigation href values.
      }
    },
    { passive: true },
  );

  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  let started = false;

  const formContext = () => ({
    service: String(form.elements.service?.value || params.get("service") || "unspecified"),
    budget_bucket: String(form.elements.budget?.value || "unspecified"),
    agent: params.get("agent") || "none",
  });

  const markStarted = () => {
    if (started) return;
    started = true;
    track("contact_form_started", formContext());
  };

  form.addEventListener("input", markStarted, { once: true, passive: true });
  form.addEventListener("change", markStarted, { once: true, passive: true });
  form.addEventListener(
    "submit",
    () => {
      if (!form.checkValidity()) return;
      const context = formContext();
      track("contact_brief_completed", context);
      track("whatsapp_brief_opened", context);
    },
    { capture: true },
  );
})();
