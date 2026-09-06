(() => {
  "use strict";

  const host = document.querySelector("[data-bowdy-assistant]");
  if (!host) return;

  const en = document.documentElement.lang === "en";
  const phone = "+966598447530";
  const whatsapp = "https://wa.me/966598447530";
  const apiEndpoint = "/api/bowdy";
  const launcher = host.querySelector("[data-bowdy-launcher]");
  const closeButton = host.querySelector("[data-bowdy-close]");
  const panel = host.querySelector("[data-bowdy-panel]");
  const messages = host.querySelector("[data-bowdy-messages]");
  const form = host.querySelector("[data-bowdy-form]");
  const input = host.querySelector("[data-bowdy-input]");
  const send = host.querySelector("[data-bowdy-send]");
  const suggestions = host.querySelector("[data-bowdy-suggestions]");
  const history = [];
  let busy = false;

  const getSessionId = () => {
    const key = "bowdy-session-id";
    try {
      let value = sessionStorage.getItem(key);
      if (!value) {
        value = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 80);
        sessionStorage.setItem(key, value);
      }
      return value;
    } catch {
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  };

  const sessionId = getSessionId();

  const copy = en
    ? {
        welcome: "Welcome — I’m Bowdy. Tell me what you want to improve in your business, and I’ll help you find the right BOWDY LABS path.",
        typing: "Bowdy is thinking",
        fallback: "I can help with BOWDY LABS services, AI agents, software, cybersecurity, cloud, Google Business Profile, SEO, digital advertising, or our interactive BOWDY models. Tell me what you want to improve and I’ll point you to the right path.",
        unavailable: "Generative AI is temporarily unavailable, so I switched to Bowdy’s built-in knowledge mode and can still help with our services and the next best step.",
      }
    : {
        welcome: "أهلًا بك — أنا باودي. قل لي ما الذي تريد تحسينه في عملك، وسأساعدك في الوصول إلى المسار الأنسب داخل باودي لابز.",
        typing: "باودي يفكر",
        fallback: "أقدر أساعدك في خدمات باودي لابز: الذكاء الاصطناعي، تطوير المواقع والبرمجيات، الأمن السيبراني، السحابة، ملفات Google التجارية، SEO، الإعلانات الرقمية، أو نماذج باودي التفاعلية. قل لي ما الذي تريد تحسينه في عملك وسأرشح لك المسار الأقرب.",
        unavailable: "الذكاء التوليدي غير متاح مؤقتًا، لذلك انتقلت لوضع المعرفة المدمج في باودي وما زلت أقدر أساعدك في الخدمات والخطوة الأنسب.",
      };

  const intents = [
    {
      keys: ["خدمات", "services", "تقدمون", "تسوي", "تعملون", "what do you do"],
      ar: "باودي لابز تجمع بين الذكاء الاصطناعي والبرمجيات والأمن السيبراني والسحابة ومنظومة Google والنمو الرقمي. أهم المسارات: وكلاء AI، تطوير المواقع والتطبيقات، حلول RAG وقواعد المعرفة، الأمن السيبراني، SEO، ملفات Google التجارية، والإعلانات الرقمية.",
      en: "BOWDY LABS combines AI, software, cybersecurity, cloud, Google ecosystem services and digital growth. Core tracks include AI agents, websites and applications, secure RAG and knowledge systems, cybersecurity, SEO, Google Business Profile and digital advertising.",
      links: [["services", en ? "/en/services/" : "/services/"]],
    },
    {
      keys: ["ذكاء", "ai", "agent", "agents", "وكيل", "وكلاء", "chatbot", "شات بوت", "مساعد ذكي"],
      ar: "نبني وكلاء ذكاء اصطناعي ومساعدين عرب، ونربطهم بقواعد المعرفة ومسارات العمل والأنظمة حسب الصلاحيات. نقدر نصمم مساعد خدمة عملاء، مساعد مبيعات، بحث داخلي، أتمتة، أو وكيل متخصص لعملية معينة.",
      en: "We build AI agents and Arabic assistants connected to knowledge bases, workflows and business systems with scoped permissions. This can cover support, sales, internal search, automation or a specialized operational agent.",
      links: [["agents", en ? "/en/agents/" : "/agents/"], ["models", en ? "/en/experience/" : "/experience/"]],
    },
    {
      keys: ["موقع", "website", "web", "تطبيق", "app", "برمجة", "software"],
      ar: "نطوّر مواقع وتطبيقات وتجارب رقمية سريعة ومتجاوبة، مع اهتمام بالهوية والأداء وSEO والتحويلات والتكاملات. اذكر لي نوع النشاط والهدف وسأحدد المسار الأقرب.",
      en: "We build fast responsive websites, applications and digital experiences with strong attention to brand, performance, SEO, conversions and integrations. Tell me your business type and goal and I’ll narrow the best path.",
      links: [["web", en ? "/en/services/web-development/" : "/services/web-development/"]],
    },
    {
      keys: ["seo", "سيو", "جوجل", "google", "خرائط", "maps", "ملف تجاري", "business profile", "ظهور"],
      ar: "مسار الظهور عندنا يشمل SEO تقني ومحلي، صفحات الخدمات والمحتوى، بنية الروابط والبيانات المنظمة، وملفات Google التجارية والخرائط. نبدأ بتشخيص الظهور الحالي ثم نحدد الإصلاحات ذات الأثر الفعلي.",
      en: "Our visibility work covers technical and local SEO, service/content architecture, internal linking and structured data, plus Google Business Profile and Maps. We start by diagnosing current visibility, then prioritize changes tied to real enquiries.",
      links: [["seo", en ? "/en/services/seo/" : "/services/seo/"], ["google", en ? "/en/services/google-business-profile/" : "/services/google-business-profile/"]],
    },
    {
      keys: ["امن", "أمن", "security", "cyber", "سايبر", "سحابة", "cloud"],
      ar: "نقدّم مسارات أمن سيبراني وحلول سحابية آمنة تشمل مراجعة البنية، تقليل المخاطر، تعزيز الضوابط، وتأمين التكاملات والأنظمة. نطاق العمل يتحدد حسب البيئة والبيانات والأنظمة الحساسة لديك.",
      en: "We provide cybersecurity and secure-cloud tracks covering architecture review, risk reduction, stronger controls and safer integrations. Scope depends on your environment, data sensitivity and connected systems.",
      links: [["security", en ? "/en/services/cybersecurity/" : "/services/cybersecurity/"], ["cloud", en ? "/en/services/cloud-solutions/" : "/services/cloud-solutions/"]],
    },
    {
      keys: ["اعلان", "إعلان", "ads", "advertising", "حملة", "campaign"],
      ar: "نراجع الحملات من زاوية جودة الزيارات والتحويلات وليس النقرات فقط: الكلمات، نية البحث، الاستبعادات، الصفحات المقصودة، القياس، المكالمات وواتساب، ثم نربط التحسين بهدف تجاري واضح.",
      en: "We review campaigns around qualified traffic and conversions, not clicks alone: search intent, keywords, negatives, landing pages, tracking, calls and WhatsApp, then tie optimization to a clear business outcome.",
      links: [["ads", en ? "/en/services/digital-advertising/" : "/services/digital-advertising/"]],
    },
    {
      keys: ["rise", "pulse", "scout", "echo", "relay", "core", "نماذج", "models", "experience"],
      ar: "نماذج باودي التفاعلية تشرح تصورًا متكاملًا لمنظومة الأعمال: RISE للفرص والإيراد، PULSE للقرار، SCOUT للبحث والظهور، ECHO للمحادثات، RELAY للأتمتة، وCORE للأساس المشترك والصلاحيات.",
      en: "BOWDY interactive models illustrate a connected business system: RISE for revenue operations, PULSE for decisions, SCOUT for search visibility, ECHO for conversations, RELAY for workflows and CORE for shared identity and permissions.",
      links: [["models", en ? "/en/experience/" : "/experience/"]],
    },
    {
      keys: ["سعر", "تكلفة", "price", "pricing", "cost", "ميزانية", "budget"],
      ar: "التكلفة تختلف حسب نطاق العمل والتكاملات والبيانات ومستوى الأمان والمدة. اذكر لي نوع المشروع والهدف الحالي وسأساعدك أولًا في تحديد النطاق الصحيح قبل التسعير.",
      en: "Pricing depends on scope, integrations, data, security requirements and delivery timeline. Tell me the project type and desired outcome and I’ll first help define the right scope.",
      links: [["contact", en ? "/en/contact/" : "/contact/"]],
    },
    {
      keys: ["تواصل", "واتساب", "اتصال", "contact", "whatsapp", "call", "phone", "رقم"],
      ar: "تقدر تتواصل مباشرة على 059 844 7530 أو عبر واتساب. ولو كتبت لي نوع المشروع في سطر واحد أساعدك أولًا في تحديد المسار المناسب.",
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

  const localAnswer = (query) => {
    const q = normalize(query);
    const match = intents.find((item) => item.keys.some((key) => q.includes(normalize(key))));
    return match
      ? { text: en ? match.en : match.ar, links: match.links }
      : { text: copy.fallback, links: [["services", en ? "/en/services/" : "/services/"], ["contact", en ? "/en/contact/" : "/contact/"]] };
  };

  const contactLinks = () => [["whatsapp", whatsapp], ["call", `tel:${phone}`]];

  const askGenerative = async (query) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        signal: controller.signal,
        body: JSON.stringify({
          message: query,
          language: en ? "en" : "ar",
          sessionId,
          history: history.slice(-8),
          page: { path: location.pathname, title: document.title },
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok || !data?.reply) throw new Error(data?.code || `http_${response.status}`);
      return {
        text: String(data.reply).trim(),
        links: data.showContact ? contactLinks() : [],
      };
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const respond = async (query) => {
    if (busy) return;
    busy = true;
    addMessage(query, true);
    input.value = "";
    input.style.height = "auto";
    send.disabled = true;
    const typing = showTyping();

    let result;
    try {
      result = await askGenerative(query);
      history.push({ role: "user", content: query.slice(0, 700) });
      history.push({ role: "assistant", content: result.text.slice(0, 1200) });
      if (history.length > 12) history.splice(0, history.length - 12);
    } catch (error) {
      console.info("Bowdy generative fallback", error?.message || error);
      result = localAnswer(query);
    } finally {
      typing.remove();
      addMessage(result.text, false, result.links);
      busy = false;
      send.disabled = false;
      input.focus();
    }
  };

  const setOpen = (open) => {
    host.classList.toggle("is-open", open);
    launcher?.setAttribute("aria-expanded", String(open));
    panel?.setAttribute("aria-hidden", String(!open));
    if (open) {
      window.setTimeout(() => input?.focus(), 80);
      if (!messages.children.length) addMessage(copy.welcome, false, [["services", en ? "/en/services/" : "/services/"], ["models", en ? "/en/experience/" : "/experience/"]]);
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
    if (!value || busy) return;
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
    button.addEventListener("click", () => {
      const query = button.dataset.query || button.textContent;
      if (query && !busy) respond(query);
    });
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
