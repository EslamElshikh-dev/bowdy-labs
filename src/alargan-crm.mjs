export function alarganCrmPage({ view = "proposal" } = {}) {
  const pages = {
    proposal: {
      title: "عرض مشروع CRM لشركة مشاريع الأرجان | Bowdy Labs",
      description: "التصور التنفيذي المحدث لمنصة إدارة علاقات العملاء والمبيعات المقترحة لشركة مشاريع الأرجان، مقدم من Bowdy Labs.",
      canonical: "https://bowdylabs.com/alarjancrm/",
      source: "https://alargan-crm-proposal.vercel.app/",
      frameTitle: "عرض مشروع CRM لشركة مشاريع الأرجان — Bowdy Labs",
      fallbackLabel: "العرض",
    },
    dashboard: {
      title: "لوحة تحكم نظام CRM لشركة مشاريع الأرجان | Bowdy Labs",
      description: "لوحة التحكم التنفيذية وهيكلة نظام إدارة علاقات العملاء والمبيعات المقترح لشركة مشاريع الأرجان.",
      canonical: "https://bowdylabs.com/alarjancrm/dashboard/",
      source: "https://alargan-crm-proposal.vercel.app/dashboard",
      frameTitle: "لوحة تحكم CRM لشركة مشاريع الأرجان — Bowdy Labs",
      fallbackLabel: "لوحة التحكم",
    },
    sap: {
      title: "خطة تكامل SAP S/4HANA مع نظام CRM | Bowdy Labs",
      description: "خطة مرحلية لربط SAP S/4HANA بنظام CRM لشركة مشاريع الأرجان، وتشغيل جسر البيانات، وخارطة الانتقال المستقبلية.",
      canonical: "https://bowdylabs.com/alarjancrm/sap-integration/",
      source: "https://alargan-crm-proposal.vercel.app/sap-integration",
      frameTitle: "خطة تكامل SAP S/4HANA مع CRM — Bowdy Labs",
      fallbackLabel: "خطة التكامل",
    },
  };
  const page = pages[view] ?? pages.proposal;

  return String.raw`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="theme-color" content="#071923">
  <link rel="canonical" href="${page.canonical}">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="BOWDY LABS">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${page.canonical}">
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
    src="${page.source}"
    title="${page.frameTitle}"
    loading="eager"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="clipboard-write; fullscreen"
  ></iframe>
  <noscript>
    <p class="fallback">هذه الصفحة تحتاج JavaScript لعرض النسخة التفاعلية. <a href="${page.source}">فتح ${page.fallbackLabel} مباشرة</a>.</p>
  </noscript>
</body>
</html>`;
}
