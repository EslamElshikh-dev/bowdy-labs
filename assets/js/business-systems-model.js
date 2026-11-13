// Deterministic, synthetic examples. No network, customer data, or AI inference.
export const serviceSlugs = {
  crm: "crm-development",
  dashboard: "business-dashboards",
  booking: "booking-systems",
  chat: "ai-chatbots",
};

export function crmTransition(state, action) {
  const next = { ...state };
  if (action === "assign") return { ...next, assigned: true, notice: "assigned" };
  if (action === "followup") return next.assigned
    ? { ...next, followup: true, notice: "scheduled" }
    : { ...next, notice: "needs-owner" };
  if (action === "duplicate") return { ...next, notice: "duplicate" };
  if (action === "reset") return { assigned: false, followup: false, count: 1, notice: "ready" };
  return next;
}

export function bookingTransition(state, action, slot) {
  if (action === "reset") return { booked: null, selected: "09:00", editing: false, notice: "ready" };
  if (action === "select" && ["09:00", "10:30", "12:00"].includes(slot)) return { ...state, selected: slot, notice: "selected" };
  if (action === "edit") return state.booked
    ? { ...state, editing: true, notice: "choose-new" }
    : { ...state, notice: "needs-booking" };
  if (action === "conflict") return { ...state, notice: state.booked ? "conflict" : "needs-booking" };
  if (action === "confirm") {
    if (state.booked && !state.editing) return { ...state, notice: "conflict" };
    if (state.editing && state.selected === state.booked) return { ...state, notice: "choose-new" };
    return { ...state, booked: state.selected, editing: false, notice: state.booked ? "rescheduled" : "confirmed" };
  }
  return { ...state };
}

export function dashboardTransition(state, action, value) {
  if (action === "source") return { ...state, stale: !state.stale, notice: state.stale ? "restored" : "stale" };
  if (action === "branch" && ["all", "main", "north"].includes(value)) return { ...state, branch: value, notice: "filtered" };
  if (action === "role" && ["staff", "manager"].includes(value)) return { ...state, role: value, notice: "role" };
  if (action === "approve") return state.role === "manager"
    ? { ...state, approved: true, notice: "approved" }
    : { ...state, notice: "restricted" };
  return { ...state };
}

export function makePlan(problem = "crm", tools = "sheets", approval = "yes") {
  const key = Object.hasOwn(serviceSlugs, problem) ? problem : "crm";
  return {
    problem: key,
    service: serviceSlugs[key],
    tools: ["sheets", "platform", "several"].includes(tools) ? tools : "sheets",
    approval: approval === "no" ? "no" : "yes",
  };
}

export function contactPlan(search) {
  const params = new URLSearchParams(search);
  const key = Object.keys(serviceSlugs).find(k => serviceSlugs[k] === params.get("service"));
  return key ? makePlan(key, params.get("tools"), params.get("approval")) : null;
}
