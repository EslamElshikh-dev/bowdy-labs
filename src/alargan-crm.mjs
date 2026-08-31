export function alarganCrmPage({ dashboard = false } = {}) {
  const pageTitle = dashboard
    ? "لوحة تحكم نظام CRM لشركة مشاريع الأرجان | Bowdy Labs"
    : "عرض مشروع CRM لشركة مشاريع الأرجان | Bowdy Labs";
  const pageDescription = dashboard
    ? "لوحة التحكم التنفيذية وهيكلة نظام إدارة علاقات العملاء والمبيعات المقترح لشركة مشاريع الأرجان."
    : "التصور التنفيذي المحدث لمنصة إدارة علاقات العملاء والمبيعات المقترحة لشركة مشاريع الأرجان، مقدم من Bowdy Labs.";
  const canonical = dashboard
    ? "https://bowdylabs.com/alarjancrm/dashboard/"
    : "https://bowdylabs.com/alarjancrm/";
  const proposalUrl = dashboard
    ? "https://alargan-crm-proposal.vercel.app/dashboard"
    : "https://alargan-crm-proposal.vercel.app/";

  return String.raw`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDescription}">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="theme-color" content="#071923">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="BOWDY LABS">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://bowdylabs.com/assets/og/bowdy-labs-og.png">
  <style>
    :root{color-scheme:dark;background:#071923}
    *{box-sizing:border-box}
    html,body{width:100%;height:100%;margin:0;background:#071923;overflow:hidden}
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .proposal-frame{display:block;width:100%;height:100dvh;min-height:100vh;border:0;background:#071923}
    .fallback{position:fixed;inset:auto 16px 16px;z-index:2;margin:auto;max-width:760px;padding:12px 16px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(7,25,35,.92);color:#fff;text-align:center;font-size:14px;line-height:1.7}
    .fallback a{color:#d6b46c;font-weight:700}
    @media print{html,body{overflow:visible}.proposal-frame{height:100vh}.fallback{display:none}}
  </style>
</head>
<body>
  <iframe
    class="proposal-frame"
    src="${proposalUrl}"
    title="${dashboard ? "لوحة تحكم" : "عرض مشروع"} CRM لشركة مشاريع الأرجان — Bowdy Labs"
    loading="eager"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="clipboard-write; fullscreen"
  ></iframe>
  <noscript>
    <p class="fallback">هذه الصفحة تحتاج JavaScript لعرض النسخة التفاعلية. <a href="${proposalUrl}">فتح ${dashboard ? "لوحة التحكم" : "العرض"} مباشرة</a>.</p>
  </noscript>
</body>
</html>`;
}
