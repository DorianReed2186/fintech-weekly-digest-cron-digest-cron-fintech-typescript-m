import test from "node:test";
import assert from "node:assert/strict";
import { selectNotifications } from "./digest_service.js";

test("digest keeps high-risk or high-value payment events for audit review", () => {
  const selected = selectNotifications([
    { event_id: "low", account_id: "acct-1", amount_cents: 1200, currency: "USD", occurred_at: "2026-01-05T10:00:00.000Z", risk_score: 0.2 },
    { event_id: "risk", account_id: "acct-2", amount_cents: 1200, currency: "USD", occurred_at: "2026-01-05T10:00:00.000Z", risk_score: 0.8 },
    { event_id: "value", account_id: "acct-3", amount_cents: 150000, currency: "USD", occurred_at: "2026-01-05T10:00:00.000Z", risk_score: 0.1 }
  ]);
  assert.deepEqual(selected.map((event) => event.event_id), ["risk", "value"]);
});
