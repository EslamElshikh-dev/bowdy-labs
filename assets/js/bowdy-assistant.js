(() => {
  "use strict";

  const host = document.querySelector("[data-bowdy-assistant]");
  if (!host) return;

  const en = document.documentElement.lang === "en";
  const phone = "+966598447530";
  const whatsapp = "https://wa.me/966598447530";
  const launcher = host.querySelector("[data-bowdy-launcher]");
  const closeButton = host.querySelector("[data-bowdy-close]");
  const panel = host.querySelector("[data-bowdy-panel]");
  const messages = host.querySelector("[data-bowdy-messages]");
  const form = host.querySelector("[data-bowdy-form]");
  const input = host.querySelector("[data-bowdy-input]");
  const send = host.querySelector("[data-bowdy-send]");
  const suggestions = host.querySelector("[data-bowdy-suggestions]");

  const copy = en
    ? {
        welcome: "Welcome — I’m Bowdy. I can help you understand our services, AI agents, BOWDY models, project fit, and the best next step for your business.",
        placeholder: "Ask Bowdy about services, AI, software, SEO…",
        typing: "Bowdy is thinking",
        contact: "For a project-specific recommendation, I can also move the conversation to WhatsApp or a phone call.",
        fallback: "I can help with BOWDY LABS services, AI agents, software, cybersecurity, cloud, Google Business Profile, SEO, digital advertising, or our interactive BOWDY models. Tell me what you want to improve and I’ll point you to the right path.",
      }
    : {
        welcome: "أهلًا بك — أنا باودي. أقدر أساعدك تفهم خدماتنا ووكلاء الذكاء الاصطناعي ونماذج باودي، وأرشح لك المسار الأنسب حسب هدف مشروعك.",
        placeholder: "اسأل باودي عن الخدمات، الذكاء الاصطناعي، المواقع، السيو…",
        typing: "باودي يفكر",
        contact: "ولو تحتاج توصية أدق لمشروعك، أقدر أنقلك مباشرة لواتساب أو الاتصال.",
        fallback: "أقدر أساعدك في خدمات باودي لابز: الذكاء الاصطناعي، تطوير المواقع والبرمجيات، الأمن السيبراني، السحابة، ملفات Google التجارية، SEO، الإعلانات الرقمية، أو نماذج باودي التفاعلية. قل لي ما الذي تريد تحسينه في عملك وسأرشح لك المسار الأقرب.",
      };

  const intents = [
    {
      keys: ["خدمات", "services", "تقدمون", "تسوي", "تعملون", "what do you do"],
      ar: "باودي لابز تجمع بين الذكاء الاصطناعي والبرمجيات والأمن السيبراني والسحابة ومنظومة Google والنمو الرقمي. أهم المسارات: وكلاء AI، تطوير المواقع والتطبيقات، حلول RAG وقواعد المعرفة، الأمن السيبراني، SEO، ملفات Google التجارية، والإعلانات الرقمية.",
      en: "BOWDY LABS combines AI, software, cybersecurity, cloud, Google ecosystem services and digital growth. Core tracks include AI agents, websites and applications, secure RAG and knowledge systems, cybersecurity, SEO, Google Business Profile and digital advertising.",
      links: [["services", "/services/"]],
    },
    {
      keys: ["ذكاء", "ai", "agent", "agents", "وكيل", "وكلاء", "chatbot", "شات بوت", "مساعد ذكي"],
      ar: "نعم. نبني وكلاء ذكاء اصطناعي ومساعدين عرب، ونربطهم بقواعد المعرفة ومسارات العمل والأنظمة حسب الصلاحيات. نقدر نصمم مساعد خدمة عملاء، مساعد مبيعات، بحث داخلي، أتمتة، أو وكيل متخصص لعملية معينة.",
      en: "Yes. We build AI agents and Arabic assistants connected to knowledge bases, workflows and business systems with scoped permissions. This can cover support, sales, internal search, automation or a specialized operational agent.",
      links: [["agents", "/agents/"], ["models", "/experience/"]],
    },
    {
      keys: ["موقع", "website", "web", "تطبيق", "app", "برمجة", "software"],
      ar: "نطوّر مواقع وتطبيقات وتجارب رقمية سريعة ومتجاوبة، مع اهتمام بالهوية والأداء وSEO والتحويلات والتكاملات. لو هدفك موقع شركة، منصة داخلية، CRM أو تجربة مخصصة، اذكر لي نوع النشاط والهدف وسأحدد المسار الأقرب.",
      en: "We build fast responsive websites, applications and digital experiences with strong attention to brand, performance, SEO, conversions and integrations. Tell me whether you need a company site, internal platform, CRM or custom product and I’ll narrow the best path.",
      links: [["web", "/services/web-development/"]],
    },
    {
      keys: ["seo", "سيو", "جوجل", "google", "خرائط", "maps", "ملف تجاري", "business profile", "ظهور"],
      ar: "مسار الظهور عندنا يشمل SEO تقني ومحلي، صفحات الخدمات والمحتوى، بنية الروابط والبيانات المنظمة، وملفات Google التجارية والخرائط. نبدأ بتشخيص الظهور الحالي ثم نحدد الإصلاحات التي لها أثر فعلي على الزيارات والطلبات.",
      en: "Our visibility work covers technical and local SEO, service/content architecture, internal linking and structured data, plus Google Business Profile and Maps. We start by diagnosing current visibility, then prioritize changes tied to real traffic and enquiries.",
      links: [["seo", "/services/seo/"], ["google", "/services/google-business-profile/"]],
    },
    {
      keys: ["امن", "أمن", "security", "cyber", "سايبر", "سحابة", "cloud"],
      ar: "نقدّم مسارات أمن سيبراني وحلول سحابية آمنة تشمل مراجعة البنية، تقليل المخاطر، تعزيز الضوابط، وتأمين التكاملات والأنظمة. نطاق العمل يُحدد حسب البيئة والبيانات والأنظمة الحساسة الموجودة لديك.",
      en: "We provide cybersecurity and secure-cloud tracks covering architecture review, risk reduction, stronger controls and safer integrations. Scope depends on your environment, data sensitivity and connected systems.",
      links: [["security", "/services/cybersecurity/"], ["cloud", "/services/cloud-solutions/"]],
    },
    {
      keys: ["اعلان", "إعلان", "ads", "advertising", "حملة", "campaign"],
      ar: "نراجع الحملات من زاوية جودة الزيارات والتحويلات وليس النقرات فقط: الكلمات، نية البحث، الاستبعادات، الصفحات المقصودة، القياس، المكالمات وواتساب، ثم نربط التحسين بهدف تجاري واضح.",
      en: "We review campaigns around qualified traffic and conversions, not clicks alone: search intent, keywords, negatives, landing pages, tracking, calls and WhatsApp, then tie optimization to a clear business outcome.",
      links: [["ads", "/services/digital-advertising/"]],
    },
    {
      keys: ["rise", "pulse", "scout", "echo", "relay", "core", "نماذج", "models", "experience"],
      ar: "نماذج باودي التفاعلية تشرح تصورًا متكاملًا لمنظومة الأعمال: RISE للفرص والإيراد، PULSE للقرار، SCOUT للبحث والظهور، ECHO للمحادثات، RELAY للأتمتة، وCORE للأساس المشترك والصلاحيات.",
      en: "BOWDY interactive models illustrate a connected business system: RISE for revenue operations, PULSE for decisions, SCOUT for search visibility, ECHO for conversations, RELAY for workflows and CORE for shared identity and permissions.",
      links: [["models", en ? "/en/experience/" : "/experience/"]],
    },
    {
      keys: ["سعر", "تكلفة", "price", "pricing", "cost", "ميزانية", "budget"],
      ar: "التكلفة تختلف حسب نطاق العمل والتكاملات والبيانات ومستوى الأمان والمدة. الأفضل تحدد لي نوع المشروع والهدف الحالي، وبعدها نوجّهك للمسار الصحيح قبل أي تسعير.",
      en: "Pricing depends on scope, integrations, data, security requirements and delivery timeline. The best first step is to define the project type and target outcome, then we can route you to the right scope before pricing.",
      links: [["contact", "/contact/"]],
    },
    {
      keys: ["تواصل", "واتساب", "اتصال", "contact", "whatsapp", "call", "phone", "رقم"],
      ar: "تقدر تتواصل مباشرة على 059 844 7530 أو عبر واتساب. ولو كتبت لي هنا نوع المشروع في سطر واحد أساعدك أولًا في تحديد المسار المناسب.",
      en: "You can call 059 844 7530 or continue on WhatsApp. If you describe your project in one line here, I can first help identify the most suitable path.",
      links: [["whatsapp", whatsapp], ["call", `tel:${phone}`]],
    },
  ];

  const labels = {
    services: en ? "View services" : "عرض الخدمات",
    agents: en ? "AI Agents" : "وكلاء باودي",
    models: en ? "BOWDY Models" : "نماذج باودي",
    web: en ? "Web development" : "تطوير المواقع",
    seo: "SEO",
    google: en ? "Google Business Profile" : "ملف Google التجاري",
    security: en ? "Cybersecurity" : "الأمن السيبراني",
    cloud: en ? "Cloud solutions" : "الحلول السحابية",
    ads: en ? "Digital advertising" : "الإعلانات الرقمية",
    contact: en ? "Start a project" : "ابدأ مشروعك",
    whatsapp: "WhatsApp",
    call: en ? "Call" : "اتصال",
  };

  const normalize = (value) => String(value || "").trim().toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه");

  const addMessage = (text, user = false, links = []) => {
    const row = document.createElement("div");
    row.className = `bowdy-assistant__message${user ? " is-user" : ""}`;

    if (!user) {
      const avatar = document.createElement("span");
      avatar.className = "bowdy-assistant__message-avatar";
      avatar.innerHTML = '<img src="/assets/media/bowdy-presenter-small-v2.webp" width="32" height="32" alt="">';
      row.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "bowdy-assistant__bubble";
    const body = document.createElement("span");
    body.textContent = text;
    bubble.appendChild(body);

    if (links.length) {
      const actions = document.createElement("div");
      actions.className = "bowdy-assistant__inline-actions";
      links.forEach(([key, href]) => {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = labels[key] || key;
        if (href.startsWith("http")) {
          a.target = "_blank";
          a.rel = "noopener";
        }
        actions.appendChild(a);
      });
      bubble.appendChild(actions);
    }

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  };

  const showTyping = () => {
    const row = document.createElement("div");
    row.className = "bowdy-assistant__message";
    row.dataset.typing = "";
    row.innerHTML = '<span class="bowdy-assistant__message-avatar"><img src="/assets/media/bowdy-presenter-small-v2.webp" width="32" height="32" alt=""></span><span class="bowdy-assistant__typing" role="status" aria-label="' + copy.typing + '"><i></i><i></i><i></i></span>';
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  };

  const answer = (query) => {
    const q = normalize(query);
    const match = intents.find((item) => item.keys.some((key) => q.includes(normalize(key))));
    return match
      ? { text: en ? match.en : match.ar, links: match.links }
      : { text: copy.fallback, links: [["services", "/services/"], ["contact", "/contact/"]] };
  };

  const respond = (query) => {
    addMessage(query, true);
    input.value = "";
    input.style.height = "auto";
    send.disabled = true;
    const typing = showTyping();
    window.setTimeout(() => {
      typing.remove();
      const result = answer(query);
      addMessage(result.text, false, result.links);
      send.disabled = false;
      input.focus();
    }, 420);
  };

  const setOpen = (open) => {
    host.classList.toggle("is-open", open);
    launcher?.setAttribute("aria-expanded", String(open));
    panel?.setAttribute("aria-hidden", String(!open));
    if (open) {
      window.setTimeout(() => input?.focus(), 80);
      if (!messages.children.length) addMessage(copy.welcome, false, [["services", "/services/"], ["models", en ? "/en/experience/" : "/experience/"]]);
    }
  };

  launcher?.addEventListener("click", () => setOpen(!host.classList.contains("is-open")));
  closeButton?.addEventListener("click", () => {
    setOpen(false);
    launcher?.focus();
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    respond(value);
  });

  input?.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 104)}px`;
  });

  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form?.requestSubmit();
    }
  });

  suggestions?.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => respond(button.dataset.query || button.textContent));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && host.classList.contains("is-open")) {
      setOpen(false);
      launcher?.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!host.classList.contains("is-open")) return;
    if (!host.contains(event.target)) setOpen(false);
  });

  setOpen(false);
})();
