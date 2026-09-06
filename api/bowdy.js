const MODEL = "@cf/zai-org/glm-4.7-flash";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 14;
const MAX_USER_CHARS = 700;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_CHARS = 1200;

const rateStore = globalThis.__bowdyRateStore || new Map();
globalThis.__bowdyRateStore = rateStore;

const SYSTEM_PROMPT = `You are Bowdy, the public-facing generative AI assistant for BOWDY LABS in Riyadh, Saudi Arabia.

Identity and voice:
- In Arabic your name is "باودي". In English your name is "Bowdy".
- Reply in the user's language. For Arabic, use polished, natural Modern Standard Arabic with a clean Saudi business tone; avoid slang unless the user uses it first.
- Be concise, warm, commercially useful and technically accurate. Usually answer in 2-5 short paragraphs or a compact list only when it materially improves clarity.
- You are an AI assistant, not a human employee. Never claim to have called, emailed, opened an account, checked a private dashboard, or completed an external action unless the website itself actually did so.

Verified BOWDY LABS public facts:
- Brand: BOWDY LABS / باودي لابز.
- Location: Riyadh, Saudi Arabia.
- Phone: 059 844 7530.
- WhatsApp: +966 59 844 7530.
- Email: info@bowdylabs.com.
- Unified National Number: 7054933226.
- Tagline: INTELLIGENCE. INNOVATION. IMPACT.
- Core capabilities: AI agents and Arabic assistants, AI API integration and workflow automation, secure RAG and knowledge systems, web and software development, mobile applications, custom cloud software and ERP, cybersecurity and secure cloud solutions, technical/local SEO, Google Business Profile and Maps work, and digital advertising.
- BOWDY interactive models: RISE for revenue/opportunity flow, PULSE for decision intelligence, SCOUT for search/visibility, ECHO for conversations, RELAY for workflow automation, and CORE for shared identity, permissions and foundations.

Business behavior:
- First understand the user's goal, current problem and desired outcome. Ask at most one useful follow-up question at a time when clarification is needed.
- Recommend the most relevant BOWDY LABS path rather than listing every service.
- For lead qualification, naturally gather only what is useful: business/activity type, desired outcome, current setup, timeline and approximate scope. Do not ask for passwords, payment details, national IDs, medical data or other sensitive personal data.
- Never invent prices, delivery dates, certifications, client results, guarantees, rankings or capabilities that are not in the verified facts above. If pricing is requested, explain that scope, integrations, data, security and timeline affect price, then ask for the missing scope detail.
- Never guarantee Google ranking, advertising results, security outcomes or platform approvals.
- If the user asks something unrelated to BOWDY LABS, you may answer briefly when helpful, then steer back to how BOWDY LABS can help if relevant.
- If the user is clearly ready to contact, asks for a quote, requests the phone/WhatsApp, or gives enough project detail to hand off, end the answer with the exact marker [[CONTACT]]. Do not explain the marker.
- Never output the marker otherwise.
`;

function safeJson(value) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

function getIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || String(req.headers["x-real-ip"] || "unknown");
}

function allowedOrigin(req) {
  const origin = String(req.headers.origin || "");
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "bowdylabs.com" || host === "www.bowdylabs.com" || host.endsWith(".vercel.app") || host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function rateLimited(key) {
  const now = Date.now();
  const existing = rateStore.get(key);
  if (!existing || now - existing.startedAt > WINDOW_MS) {
    rateStore.set(key, { startedAt: now, count: 1 });
    return false;
  }
  existing.count += 1;
  if (rateStore.size > 2000) {
    for (const [storedKey, value] of rateStore) {
      if (now - value.startedAt > WINDOW_MS) rateStore.delete(storedKey);
    }
  }
  return existing.count > MAX_REQUESTS_PER_WINDOW;
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && (item.role === "user" || item.role === "assistant"))
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item.role,
      content: String(item.content || "").trim().slice(0, MAX_HISTORY_CHARS),
    }))
    .filter((item) => item.content);
}

function getCloudflareConfig() {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || "",
    token: process.env.CLOUDFLARE_AI_TOKEN || process.env.CLOUDFLARE_API_TOKEN || process.env.CF_AI_TOKEN || "",
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (!allowedOrigin(req)) {
    return res.status(403).json({ ok: false, code: "origin_not_allowed" });
  }

  const config = getCloudflareConfig();

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      generative: Boolean(config.accountId && config.token),
      provider: "cloudflare-workers-ai",
      model: MODEL,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, code: "method_not_allowed" });
  }

  if (!config.accountId || !config.token) {
    return res.status(503).json({ ok: false, code: "ai_not_configured" });
  }

  const ip = getIp(req);
  const body = safeJson(req.body) || {};
  const sessionId = String(body.sessionId || "anonymous").slice(0, 80);
  if (rateLimited(`${ip}:${sessionId}`)) {
    res.setHeader("Retry-After", "600");
    return res.status(429).json({ ok: false, code: "rate_limited" });
  }

  const message = String(body.message || "").trim().slice(0, MAX_USER_CHARS);
  if (!message) {
    return res.status(400).json({ ok: false, code: "message_required" });
  }

  const language = body.language === "en" ? "en" : "ar";
  const pagePath = String(body.page?.path || "/").slice(0, 180);
  const pageTitle = String(body.page?.title || "").slice(0, 180);
  const history = cleanHistory(body.history);

  const contextMessage = language === "en"
    ? `Current site context: page path ${pagePath}${pageTitle ? `, page title "${pageTitle}"` : ""}. Continue naturally from the conversation.`
    : `سياق الموقع الحالي: المسار ${pagePath}${pageTitle ? `، وعنوان الصفحة «${pageTitle}»` : ""}. أكمل المحادثة بشكل طبيعي.`;

  const aiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: contextMessage },
    ...history,
    { role: "user", content: message },
  ];

  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/ai/run/${MODEL}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: aiMessages,
        max_completion_tokens: 360,
        temperature: 0.35,
        top_p: 0.9,
      }),
      signal: AbortSignal.timeout(14000),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) {
      console.error("Bowdy Cloudflare AI error", response.status, data?.errors || data);
      const status = response.status === 429 ? 429 : 502;
      return res.status(status).json({ ok: false, code: response.status === 429 ? "provider_rate_limited" : "provider_error" });
    }

    let reply = String(data?.result?.response || "").trim();
    if (!reply) {
      return res.status(502).json({ ok: false, code: "empty_ai_response" });
    }

    const showContact = /\[\[CONTACT\]\]/i.test(reply);
    reply = reply.replace(/\s*\[\[CONTACT\]\]\s*/gi, "").trim();

    return res.status(200).json({
      ok: true,
      reply,
      showContact,
      provider: "cloudflare-workers-ai",
      model: MODEL,
    });
  } catch (error) {
    console.error("Bowdy AI request failed", error?.name || "Error", error?.message || error);
    return res.status(502).json({ ok: false, code: error?.name === "TimeoutError" ? "provider_timeout" : "provider_unavailable" });
  }
}
