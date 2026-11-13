import test from "node:test";
import assert from "node:assert/strict";
import { crmTransition, bookingTransition, dashboardTransition, makePlan, contactPlan } from "../assets/js/business-systems-model.js";

test("CRM requires an owner before follow-up and repeated delivery does not duplicate the record", () => {
  const start = { assigned: false, followup: false, count: 1, notice: "ready" };
  const premature = crmTransition(start, "followup");
  assert.equal(premature.followup, false);
  assert.equal(premature.notice, "needs-owner");
  const assigned = crmTransition(start, "assign");
  const scheduled = crmTransition(assigned, "followup");
  const duplicate = crmTransition(scheduled, "duplicate");
  assert.equal(duplicate.count, 1);
  assert.equal(duplicate.followup, true);
  assert.equal(duplicate.assigned, true);
  assert.equal(start.assigned, false);
});

test("booking rejects a second confirmation until an explicit reschedule", () => {
  const initial = { booked: null, selected: "09:00", editing: false, notice: "ready" };
  const confirmed = bookingTransition(initial, "confirm");
  const anotherTime = bookingTransition(confirmed, "select", "10:30");
  const conflict = bookingTransition(anotherTime, "confirm");
  assert.equal(conflict.booked, "09:00");
  assert.equal(conflict.notice, "conflict");
  const editing = bookingTransition(conflict, "edit");
  const changed = bookingTransition(editing, "confirm");
  assert.equal(changed.booked, "10:30");
  assert.equal(changed.editing, false);
  assert.equal(changed.notice, "rescheduled");
  assert.equal(confirmed.booked, "09:00");
});

test("booking cannot reschedule without an appointment or silently accept an unknown time", () => {
  const initial = { booked: null, selected: "09:00", editing: false, notice: "ready" };
  assert.equal(bookingTransition(initial, "edit").notice, "needs-booking");
  assert.deepEqual(bookingTransition(initial, "select", "<script>"), initial);
  const confirmed = bookingTransition(initial, "confirm");
  const editing = bookingTransition(confirmed, "edit");
  assert.equal(bookingTransition(editing, "confirm").notice, "choose-new");
  assert.equal(bookingTransition(confirmed, "conflict").booked, "09:00");
});

test("dashboard approval is restricted by the simulated role and source outage retains the selection", () => {
  const initial = { role: "staff", branch: "north", approved: false, stale: false, notice: "ready" };
  assert.equal(dashboardTransition(initial, "approve").approved, false);
  const manager = dashboardTransition(initial, "role", "manager");
  assert.equal(dashboardTransition(manager, "approve").approved, true);
  const offline = dashboardTransition(manager, "source");
  assert.equal(offline.branch, "north");
  assert.equal(offline.stale, true);
  assert.equal(dashboardTransition(offline, "source").stale, false);
});

test("contact planning accepts only known service and scope identifiers", () => {
  assert.equal(contactPlan("?service=unknown&goal=private"), null);
  assert.deepEqual(contactPlan("?service=booking-systems&tools=several&approval=no&goal=private"), {
    problem: "booking", service: "booking-systems", tools: "several", approval: "no",
  });
  assert.deepEqual(makePlan("<script>", "private-text", "something"), {
    problem: "crm", service: "crm-development", tools: "sheets", approval: "yes",
  });
});
