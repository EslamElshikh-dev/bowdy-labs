(() => {
  "use strict";

  const PRIMARY_PHONE = "966598447530";
  const form = document.querySelector("[data-contact-form-en]");
  if (!form) return;

  const serviceNames = {
    "crm-development": "CRM & customer systems",
    "business-dashboards": "Dashboards & admin panels",
    "booking-systems": "Booking & appointment systems",
    "ai-chatbots": "Chatbots & customer assistants",
    cybersecurity: "Cybersecurity & System Protection",
    "cloud-solutions": "Secure Cloud Solutions",
    "ai-agents": "AI Agents & Automation",
    "web-development": "Web & Software Development",
    "google-support": "Google Product Consulting",
    "google-business-profile": "Google Business Profile & Maps",
    "knowledge-bases": "Knowledge Bases & Intelligent Search",
    seo: "Search Engine Optimization",
    "digital-advertising": "Digital Advertising & Measurement",
  };

  const params = new URLSearchParams(window.location.search);
  const selectedService = params.get("service");
  if (selectedService && serviceNames[selectedService] && form.elements.service) {
    form.elements.service.value = selectedService;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const service = String(values.get("service") || "");
    const goal = String(values.get("goal") || "").trim();

    const message = [
      "Hello BOWDY LABS,",
      `Name or company: ${name}`,
      `Requested capability: ${serviceNames[service] || service}`,
      "Goal and current state:",
      goal,
    ].join("\n");

    const url = `https://wa.me/${PRIMARY_PHONE}?text=${encodeURIComponent(message)}`;
    const status = form.querySelector(".form-status");
    if (status) {
      status.textContent = "Your brief is ready. Review it in WhatsApp before sending. ";
      const fallback = document.createElement("a");
      fallback.href = url;
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.textContent = "Open your message manually";
      status.append(fallback);
    }
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // The manual link remains available if opening a window is blocked.
    }
  });
})();

