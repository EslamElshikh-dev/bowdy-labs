(() => {
  "use strict";

  const PRIMARY_PHONE = "966598447530";
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const pathname = window.location.pathname.replace(/index\.html$/, "");

  const setMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open
        ? document.documentElement.lang === "en"
          ? "Close menu"
          : "إغلاق القائمة"
        : document.documentElement.lang === "en"
          ? "Open menu"
          : "فتح القائمة",
    );
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.toggleAttribute("inert", !open);
    mobileMenu.querySelectorAll("a").forEach((link) => {
      if (open) link.removeAttribute("tabindex");
      else link.setAttribute("tabindex", "-1");
    });
    document.body.classList.toggle("menu-open", open);
  };

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (
      menuButton?.getAttribute("aria-expanded") === "true" &&
      header &&
      !header.contains(event.target)
    ) {
      setMenu(false);
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setMenu(false);
  });
  setMenu(false);

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealGroups = document.querySelectorAll(
    ".services-grid, .ai-services-grid, .essential-services-grid, .iconography-grid, .work-grid, .insights-grid, .method-stack, .values-grid, .process-grid, .challenge-grid, .deliverables-grid, .standards-grid, .positioning-points, .agent-roster-list, .agent-method-grid, .agents-intro-principles",
  );
  revealGroups.forEach((group) => {
    [...group.children].forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${Math.min(index, 7) * 55}ms`);
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -28px" },
    );
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-visible"));
  }

  const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (precisePointer && !motionReduced) {
    document.querySelectorAll("[data-tilt-card]").forEach((card) => {
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      const updateTilt = () => {
        const bounds = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(pointerX - bounds.left, bounds.width));
        const y = Math.max(0, Math.min(pointerY - bounds.top, bounds.height));
        const rotateY = ((x / bounds.width) - .5) * 7;
        const rotateX = (.5 - (y / bounds.height)) * 7;
        card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
        card.style.setProperty("--glow-x", `${((x / bounds.width) * 100).toFixed(1)}%`);
        card.style.setProperty("--glow-y", `${((y / bounds.height) * 100).toFixed(1)}%`);
        frame = 0;
      };

      card.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!frame) frame = window.requestAnimationFrame(updateTilt);
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--glow-x", "50%");
        card.style.setProperty("--glow-y", "50%");
      });
    });
  }

  const filterButtons = [...document.querySelectorAll("[data-service-filter]")];
  const serviceCards = [...document.querySelectorAll("[data-services-grid] .service-card")];
  const servicesList = document.querySelector("[data-services-grid]");
  if (servicesList) servicesList.id = "services-list";

  const applyFilter = (group) => {
    filterButtons.forEach((button) => {
      const active = button.dataset.serviceFilter === group;
      button.setAttribute("aria-selected", String(active));
      button.setAttribute("tabindex", active ? "0" : "-1");
      button.setAttribute("aria-controls", "services-list");
    });
    serviceCards.forEach((card) => {
      card.hidden = group !== "all" && card.dataset.serviceGroup !== group;
    });
  };

  if (filterButtons.length && serviceCards.length) {
    applyFilter(filterButtons[0].dataset.serviceFilter);
    filterButtons.forEach((button, index) => {
      button.addEventListener("click", () => applyFilter(button.dataset.serviceFilter));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const direction = document.documentElement.dir === "rtl" ? -1 : 1;
        let target = index;
        if (event.key === "Home") target = 0;
        else if (event.key === "End") target = filterButtons.length - 1;
        else if (event.key === "ArrowRight") {
          target = (index + direction + filterButtons.length) % filterButtons.length;
        } else {
          target = (index - direction + filterButtons.length) % filterButtons.length;
        }
        filterButtons[target].focus();
        filterButtons[target].click();
      });
    });
  }

  document.querySelectorAll(".accordion details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      detail
        .closest(".accordion")
        ?.querySelectorAll("details[open]")
        .forEach((other) => {
          if (other !== detail) other.open = false;
        });
    });
  });

  const serviceNames = {
    cybersecurity: "الأمن السيبراني وحماية الأنظمة",
    "cloud-solutions": "الحلول السحابية الآمنة",
    "ai-agents": "الذكاء الاصطناعي ووكلاء AI",
    "web-development": "تطوير المواقع والتطبيقات",
    "google-support": "استشارات ودعم منتجات Google",
    "google-business-profile": "ملفات Google التجارية والخرائط",
    "knowledge-bases": "قواعد المعرفة والبحث الذكي",
    seo: "تحسين محركات البحث SEO",
    "digital-advertising": "إدارة الإعلانات الرقمية",
  };

  const agentNames = {
    tabiq: "طَبِّق — الفوترة والامتثال",
    barriz: "بَرِّز — الظهور المحلي",
    rudd: "رُدّ — خدمة العملاء",
    ammin: "أَمِّن — الدفاع السيبراني",
    salni: "سَلْني — المعرفة المؤسسية",
    nammi: "نَمِّ — أداء الحملات",
    anjiz: "أَنْجِز — إدارة المشاريع",
    thabbit: "ثَبِّت — استمرارية السحابة",
    zawwid: "زَوِّد — المبيعات",
    warrini: "وَرِّني — التحليلات التنفيذية",
  };

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const searchParams = new URLSearchParams(window.location.search);
    const selectedService = searchParams.get("service");
    const selectedAgent = searchParams.get("agent");
    if (selectedService && serviceNames[selectedService] && form.elements.service) {
      form.elements.service.value = selectedService;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const name = String(values.get("name") || "").trim();
      const service = String(values.get("service") || "");
      const budget = String(values.get("budget") || "غير محددة");
      const goal = String(values.get("goal") || "").trim();
      const message = [
        "مرحبًا باودي لابز،",
        `الاسم أو الشركة: ${name}`,
        `المسار المطلوب: ${serviceNames[service] || service}`,
        ...(agentNames[selectedAgent] ? [`الوكيل المقترح: ${agentNames[selectedAgent]}`] : []),
        `الميزانية التقريبية: ${budget}`,
        "الهدف والوضع الحالي:",
        goal,
      ].join("\n");
      const url = `https://wa.me/${PRIMARY_PHONE}?text=${encodeURIComponent(message)}`;
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      const status = form.querySelector(".form-status");
      if (status) {
        status.textContent = opened
          ? "تم تجهيز الرسالة. راجعها في WhatsApp قبل الإرسال."
          : "تعذر فتح نافذة جديدة. استخدم زر WhatsApp المباشر.";
      }
    });
  }

  document.querySelectorAll(".mobile-bottom-nav a").forEach((link) => {
    const linkPath = new URL(link.href).pathname;
    const active =
      linkPath === "/" || linkPath === "/en/"
        ? pathname === linkPath
        : pathname.startsWith(linkPath);
    if (active) link.setAttribute("aria-current", "page");
  });
})();
