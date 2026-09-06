(() => {
  "use strict";

  const PRIMARY_PHONE = "966598447530";
  const form = document.querySelector("[data-contact-form-en]");
  if (!form) return;

  const serviceNames = {
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
    const budget = String(values.get("budget") || "Not specified");
    const goal = String(values.get("goal") || "").trim();

    const message = [
      "Hello BOWDY LABS,",
      `Name or company: ${name}`,
      `Requested capability: ${serviceNames[service] || service}`,
      `Approximate budget: ${budget}`,
      "Goal and current state:",
      goal,
    ].join("\n");

    const url = `https://wa.me/${PRIMARY_PHONE}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    const status = form.querySelector(".form-status");
    if (status) {
      status.textContent = opened
        ? "Your brief is ready. Review it in WhatsApp before sending."
        : "We could not open a new window. Please use the direct WhatsApp link.";
    }
  });
})();
