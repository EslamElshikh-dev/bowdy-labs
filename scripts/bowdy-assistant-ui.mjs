import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await htmlFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(path);
  }
  return out;
}

function assistantMarkup(english) {
  const text = english
    ? {
        name: "Bowdy",
        status: "BOWDY LABS smart assistant",
        label: "Bowdy",
        close: "Close Bowdy assistant",
        launch: "Open Bowdy assistant",
        placeholder: "Ask Bowdy about services, AI, software, SEO…",
        note: "Bowdy gives general guidance and can route you to the right BOWDY LABS service.",
        suggestions: [
          ["What services do you offer?", "What services do you offer?"],
          ["I need an AI agent", "I need an AI agent"],
          ["Improve my Google visibility", "Improve my Google visibility"],
          ["Tell me about BOWDY models", "Tell me about BOWDY models"],
        ],
      }
    : {
        name: "باودي",
        status: "مساعد باودي لابز الذكي",
        label: "باودي",
        close: "إغلاق مساعد باودي",
        launch: "فتح مساعد باودي",
        placeholder: "اسأل باودي عن الخدمات، الذكاء الاصطناعي، المواقع، السيو…",
        note: "باودي يقدّم إرشادًا عامًا ويساعدك في الوصول للمسار المناسب داخل باودي لابز.",
        suggestions: [
          ["ما خدماتكم؟", "ما خدماتكم؟"],
          ["أحتاج وكيل ذكاء اصطناعي", "أحتاج وكيل ذكاء اصطناعي"],
          ["أريد تحسين ظهوري في جوجل", "أريد تحسين ظهوري في جوجل"],
          ["اشرح لي نماذج باودي", "اشرح لي نماذج باودي"],
        ],
      };

  return `<div class="bowdy-assistant" data-bowdy-assistant>
    <section class="bowdy-assistant__panel" data-bowdy-panel aria-hidden="true" aria-label="${text.status}">
      <header class="bowdy-assistant__head">
        <span class="bowdy-assistant__avatar"><img src="/assets/media/bowdy-presenter-small-v2.webp" width="46" height="46" alt=""></span>
        <span class="bowdy-assistant__identity"><strong>${text.name}</strong><span>${text.status}</span></span>
        <button class="bowdy-assistant__close" type="button" data-bowdy-close aria-label="${text.close}">×</button>
      </header>
      <div class="bowdy-assistant__messages" data-bowdy-messages aria-live="polite"></div>
      <div class="bowdy-assistant__suggestions" data-bowdy-suggestions aria-label="${english ? "Suggested questions" : "أسئلة مقترحة"}">
        ${text.suggestions.map(([label, query]) => `<button class="bowdy-assistant__suggestion" type="button" data-query="${query}">${label}</button>`).join("")}
      </div>
      <div class="bowdy-assistant__composer">
        <form class="bowdy-assistant__form" data-bowdy-form>
          <textarea class="bowdy-assistant__input" data-bowdy-input rows="1" maxlength="600" aria-label="${text.placeholder}" placeholder="${text.placeholder}"></textarea>
          <button class="bowdy-assistant__send" data-bowdy-send type="submit" aria-label="${english ? "Send message" : "إرسال الرسالة"}">↗</button>
        </form>
        <p class="bowdy-assistant__note">${text.note}</p>
      </div>
    </section>
    <div class="bowdy-assistant__launcher-wrap">
      <span class="bowdy-assistant__label" aria-hidden="true">${text.label}</span>
      <button class="bowdy-assistant__launcher" data-bowdy-launcher type="button" aria-expanded="false" aria-label="${text.launch}">
        <img src="/assets/media/bowdy-presenter-small-v2.webp" width="58" height="58" alt="">
        <span class="bowdy-assistant__status-dot" aria-hidden="true"></span>
      </button>
    </div>
  </div>`;
}

const files = await htmlFiles(dist);
let touched = 0;

for (const file of files) {
  let html = await readFile(file, "utf8");
  const english = /<html[^>]*\blang=["']en["']/i.test(html);

  html = html.replace(/<nav class="mobile-bottom-nav"[\s\S]*?<\/nav>/g, "");
  html = html.replace(/<footer class="site-footer">/g, '<footer class="site-footer site-footer-pro">');

  if (!html.includes("/assets/css/bowdy-assistant.css")) {
    html = html.replace("</head>", '  <link rel="stylesheet" href="/assets/css/bowdy-assistant.css?v=20260906">\n</head>');
  }

  if (!html.includes("/assets/css/bowdy-floating-contact-restore.css")) {
    html = html.replace("</head>", '  <link rel="stylesheet" href="/assets/css/bowdy-floating-contact-restore.css?v=20260906b">\n</head>');
  }

  if (!html.includes("/assets/css/bowdy-assistant-position.css")) {
    html = html.replace("</head>", '  <link rel="stylesheet" href="/assets/css/bowdy-assistant-position.css?v=20260906c">\n</head>');
  }

  if (!html.includes("/assets/css/bowdy-footer-polish.css")) {
    html = html.replace("</head>", '  <link rel="stylesheet" href="/assets/css/bowdy-footer-polish.css?v=20260906d">\n</head>');
  }

  if (!html.includes("data-bowdy-assistant")) {
    html = html.replace("</body>", `  ${assistantMarkup(english)}\n  <script src="/assets/js/bowdy-assistant.js?v=20260907ai" defer></script>\n</body>`);
  }

  await writeFile(file, html, "utf8");
  touched += 1;
}

console.log(`Bowdy assistant UI applied to ${touched} HTML files.`);
