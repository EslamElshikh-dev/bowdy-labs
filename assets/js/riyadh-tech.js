(() => {
  const root = document.querySelector(".rt-magazine");
  if (!root) return;
  const search = root.querySelector("[data-magazine-search]");
  const form = root.querySelector("[data-magazine-search-form]");
  const filters = root.querySelector("[data-magazine-filters]");
  const cards = [...root.querySelectorAll("[data-magazine-card]")];
  const status = root.querySelector("[data-magazine-status]");
  const empty = root.querySelector("[data-magazine-empty]");
  const source = root.querySelector("[data-magazine-source]");
  const sort = root.querySelector("[data-magazine-sort]");
  const more = root.querySelector("[data-search-more]");
  const normalize = value => value.normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0640]/gu, "").replace(/[أإآٱ]/gu, "ا").replace(/ى/gu, "ي").toLowerCase().trim();

  if (search && form && filters && cards.length) {
    form.hidden = false;
    filters.hidden = false;
    const options = root.querySelector("[data-search-options]");
    if (options) options.hidden = false;
    const buttons = [...filters.querySelectorAll("[data-magazine-filter]")];
    const validCategories = buttons.map(button => button.dataset.magazineFilter);
    const validSources = source ? [...source.querySelectorAll("option")].map(option => option.value) : ["all"];
    let category = "all";
    let visibleLimit = 12;
    const searchableCards = cards.map(card => ({ card, text: normalize(card.dataset.search ?? "") }));

    function restore() {
      const params = new URLSearchParams(location.search);
      search.value = (params.get("q") ?? "").slice(0, 120);
      category = validCategories.includes(params.get("category")) ? params.get("category") : "all";
      if (source) source.value = validSources.includes(params.get("source")) ? params.get("source") : "all";
      if (sort) sort.value = params.get("sort") === "oldest" ? "oldest" : "latest";
      visibleLimit = 12;
    }

    function update({ updateUrl = true, resetLimit = true } = {}) {
      if (resetLimit) visibleLimit = 12;
      const tokens = normalize(search.value).split(/\s+/u).filter(Boolean);
      const currentSource = source?.value ?? "all";
      const currentSort = sort?.value ?? "latest";
      const sorted = [...searchableCards].sort((a, b) => {
        const difference = Date.parse(b.card.dataset.published) - Date.parse(a.card.dataset.published);
        return currentSort === "oldest" ? -difference : difference;
      });
      let count = 0;
      for (const {card, text} of sorted) {
        const matches = (category === "all" || card.dataset.category === category) && (currentSource === "all" || (card.dataset.sourceIds ?? "").split(" ").includes(currentSource)) && tokens.every(token => text.includes(token));
        if (matches) count += 1;
        card.hidden = !matches || Boolean(more && count > visibleLimit);
        if (sort) card.parentElement.appendChild(card);
      }
      for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.magazineFilter === category));
      if (empty) empty.hidden = count !== 0;
      if (status) status.textContent = more ? `النتائج: ${count} · المعروض: ${Math.min(count, visibleLimit)}` : tokens.length || category !== "all" ? `يظهر ${count} من ${cards.length} موضوعات` : "";
      if (more) {
        more.hidden = count <= visibleLimit;
        more.textContent = `عرض نتائج أكثر (${count - Math.min(count, visibleLimit)} متبقية)`;
      }
      if (updateUrl) {
        const url = new URL(location.href);
        const values = {q:search.value.trim(), category:category === "all" ? "" : category, source:currentSource === "all" ? "" : currentSource, sort:currentSort === "latest" ? "" : currentSort};
        for (const [key,value] of Object.entries(values)) if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
        try { history.replaceState(null, "", url); } catch { /* Filtering remains usable without history access. */ }
      }
    }
    form.addEventListener("submit", event => { event.preventDefault(); update(); });
    search.addEventListener("input", () => update());
    buttons.forEach(button => button.addEventListener("click", () => { category = button.dataset.magazineFilter; update(); }));
    source?.addEventListener("change", () => update());
    sort?.addEventListener("change", () => update());
    more?.addEventListener("click", () => { visibleLimit += 12; update({resetLimit:false}); });
    root.querySelector("[data-magazine-clear]")?.addEventListener("click", () => { search.value = ""; update(); search.focus(); });
    root.querySelector("[data-magazine-reset]")?.addEventListener("click", () => {
      search.value = ""; category = "all";
      if (source) source.value = "all";
      if (sort) sort.value = "latest";
      update(); search.focus();
    });
    window.addEventListener("popstate", () => { restore(); update({updateUrl:false}); });
    restore();
    update({updateUrl:false});
  }

  const savedKey = "riyadh-tech:saved:v1";
  const sizeKey = "riyadh-tech:reader-scale:v1";
  const saveButtons = [...root.querySelectorAll("[data-save-article]")];
  const savedPage = root.querySelector("[data-saved-page]");
  const savedRows = [...root.querySelectorAll("[data-saved-card]")];
  const readerStatus = root.querySelector("[data-reader-status]");
  let storageAvailable = true;
  let saved = new Set();
  const validPath = path => typeof path === "string" && /^\/riyadh-tech\/[a-z0-9-]+\/$/.test(path);
  try {
    let stored = [];
    const raw = localStorage.getItem(savedKey);
    try { stored = JSON.parse(raw ?? "[]"); } catch { /* A malformed saved value starts an empty list. */ }
    if (Array.isArray(stored)) saved = new Set(stored.filter(validPath).slice(0, 500));
  } catch { storageAvailable = false; }

  function renderSaved() {
    for (const button of saveButtons) {
      const active = saved.has(button.dataset.saveArticle);
      button.setAttribute("aria-pressed", String(active));
      button.disabled = !storageAvailable;
      button.textContent = savedPage ? "إزالة من القائمة" : active ? "محفوظ في قائمة القراءة ✓" : "احفظ للقراءة لاحقًا";
    }
    for (const badge of root.querySelectorAll("[data-saved-count]")) {
      badge.textContent = String(saved.size);
      badge.hidden = saved.size === 0;
    }
    if (!savedPage) return;
    let visible = 0;
    for (const row of savedRows) { row.hidden = !saved.has(row.dataset.savedCard); if (!row.hidden) visible += 1; }
    const message = savedPage.querySelector("[data-saved-status]");
    if (message) message.textContent = storageAvailable ? `المحفوظ للقراءة: ${visible}` : "تعذّر الوصول إلى التخزين في هذا المتصفح.";
    const placeholder = savedPage.querySelector("[data-saved-empty]");
    if (placeholder) placeholder.hidden = visible > 0;
    const hint = savedPage.querySelector("[data-saved-empty-message]");
    if (hint && !storageAvailable) hint.textContent = "اسمح للموقع باستخدام التخزين المحلي لعرض قائمة القراءة وحفظ الموضوعات.";
    const clear = savedPage.querySelector("[data-clear-saved]");
    if (clear) clear.hidden = saved.size === 0 || !storageAvailable;
  }

  function persistSaved(next) {
    try {
      localStorage.setItem(savedKey, JSON.stringify([...next]));
      saved = next;
      return true;
    } catch {
      storageAvailable = false;
      if (readerStatus) readerStatus.textContent = "تعذّر الحفظ في هذا المتصفح. اسمح بالتخزين المحلي ثم أعد المحاولة.";
      return false;
    }
  }
  for (const button of saveButtons) button.addEventListener("click", () => {
    const path = button.dataset.saveArticle;
    if (!storageAvailable || !validPath(path)) return;
    const next = new Set(saved);
    if (next.has(path)) next.delete(path); else { if (next.size >= 500) next.delete(next.values().next().value); next.add(path); }
    if (persistSaved(next) && readerStatus) readerStatus.textContent = saved.has(path) ? "أُضيف المقال إلى قائمة القراءة على هذا الجهاز." : "أُزيل المقال من قائمة القراءة.";
    renderSaved();
  });
  root.querySelector("[data-clear-saved]")?.addEventListener("click", () => { persistSaved(new Set()); renderSaved(); });
  window.addEventListener("storage", event => {
    if (event.key !== savedKey) return;
    try {
      const stored = JSON.parse(event.newValue ?? "[]");
      saved = new Set(Array.isArray(stored) ? stored.filter(validPath).slice(0, 500) : []);
      renderSaved();
    } catch { /* Ignore an invalid value from another tab. */ }
  });
  renderSaved();

  const tools = root.querySelector("[data-reader-tools]");
  if (tools) {
    tools.hidden = false;
    let scale = 1;
    try { const value = Number(localStorage.getItem(sizeKey)); if (value >= 0.9 && value <= 1.3) scale = value; } catch { /* Text size remains usable without persistence. */ }
    const smaller = tools.querySelector("[data-reader-smaller]");
    const larger = tools.querySelector("[data-reader-larger]");
    function renderScale() {
      root.style.setProperty("--rt-reader-scale", String(scale));
      tools.querySelector("[data-reader-size]").textContent = `${Math.round(scale * 100)}٪`;
      smaller.disabled = scale <= 0.9;
      larger.disabled = scale >= 1.3;
    }
    function resize(delta) {
      scale = Math.min(1.3, Math.max(0.9, Math.round((scale + delta) * 10) / 10));
      renderScale();
      try { localStorage.setItem(sizeKey, String(scale)); } catch { /* Keep the selected size for this page. */ }
    }
    smaller.addEventListener("click", () => resize(-0.1));
    larger.addEventListener("click", () => resize(0.1));
    tools.querySelector("[data-reader-print]").addEventListener("click", () => window.print());
    if (!storageAvailable && readerStatus) readerStatus.textContent = "الحفظ غير متاح في هذا المتصفح؛ أدوات القراءة متاحة.";
    renderScale();
  }

  const progress = root.querySelector("[data-reading-progress]");
  const reading = root.querySelector("[data-reading-article]");
  if (progress && reading && typeof requestAnimationFrame === "function") {
    progress.hidden = false;
    let pending = false;
    function renderProgress() {
      const rect = reading.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const value = Math.round(Math.min(100, Math.max(0, -rect.top / total * 100)));
      progress.setAttribute("aria-valuenow", String(value));
      progress.firstElementChild.style.width = `${value}%`;
      pending = false;
    }
    function scheduleProgress() { if (!pending) { pending = true; requestAnimationFrame(renderProgress); } }
    window.addEventListener("scroll", scheduleProgress, {passive:true});
    window.addEventListener("resize", scheduleProgress);
    renderProgress();
  }

  const copy = root.querySelector("[data-magazine-copy]");
  if (copy && navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      const copyStatus = root.querySelector("[data-magazine-copy-status]");
      try {
        await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]').href);
        copyStatus.textContent = "تم نسخ الرابط";
      } catch {
        copyStatus.textContent = "تعذّر النسخ. انسخ الرابط من شريط العنوان.";
      }
    });
  }
})();
