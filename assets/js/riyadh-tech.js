(() => {
  const root = document.querySelector(".rt-magazine");
  if (!root) return;
  const search = root.querySelector("[data-magazine-search]");
  const form = root.querySelector("[data-magazine-search-form]");
  const filters = root.querySelector("[data-magazine-filters]");
  const cards = [...root.querySelectorAll("[data-magazine-card]")];
  const status = root.querySelector("[data-magazine-status]");
  const empty = root.querySelector("[data-magazine-empty]");
  const normalize = value => value.normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0640]/gu, "").replace(/[أإآٱ]/gu, "ا").replace(/ى/gu, "ي").toLowerCase().trim();
  let category = "all";

  if (search && cards.length) {
    form.hidden = false;
    filters.hidden = false;
    const buttons = [...filters.querySelectorAll("[data-magazine-filter]")];
    const params = new URLSearchParams(location.search);
    search.value = (params.get("q") ?? "").slice(0, 120);
    const validCategories = buttons.map(button => button.dataset.magazineFilter);
    category = validCategories.includes(params.get("category")) ? params.get("category") : "all";
    const searchableCards = cards.map(card => ({ card, text: normalize(card.dataset.search ?? "") }));

    function update({ updateUrl = true } = {}) {
      const tokens = normalize(search.value).split(/\s+/u).filter(Boolean);
      let count = 0;
      for (const {card, text} of searchableCards) {
        const visible = (category === "all" || card.dataset.category === category) && tokens.every(token => text.includes(token));
        card.hidden = !visible;
        if (visible) count += 1;
      }
      for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.magazineFilter === category));
      empty.hidden = count !== 0;
      status.textContent = tokens.length || category !== "all" ? `يظهر ${count} من ${cards.length} موضوعات` : "";
      if (updateUrl) {
        const url = new URL(location.href);
        if (search.value.trim()) url.searchParams.set("q", search.value.trim()); else url.searchParams.delete("q");
        if (category !== "all") url.searchParams.set("category", category); else url.searchParams.delete("category");
        try { history.replaceState(null, "", url); } catch { /* Filtering works even when history is unavailable. */ }
      }
    }
    form.addEventListener("submit", event => { event.preventDefault(); update(); });
    search.addEventListener("input", () => update());
    buttons.forEach(button => button.addEventListener("click", () => { category = button.dataset.magazineFilter; update(); }));
    root.querySelector("[data-magazine-clear]").addEventListener("click", () => { search.value = ""; update(); search.focus(); });
    root.querySelector("[data-magazine-reset]").addEventListener("click", () => { search.value = ""; category = "all"; update(); search.focus(); });
    update({updateUrl:false});
  }

  const copy = root.querySelector("[data-magazine-copy]");
  if (copy && navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      const status = root.querySelector("[data-magazine-copy-status]");
      try {
        await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]').href);
        status.textContent = "تم نسخ الرابط";
      } catch {
        status.textContent = "تعذّر النسخ. انسخ الرابط من شريط العنوان.";
      }
    });
  }
})();
