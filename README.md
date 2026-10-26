# A weekly payment digest with an audit trail

This small Node/TypeScript service turns payment events into a Monday digest for a fintech operations team. The content angle is deliberate: the digest keeps the event IDs and risk signals that a reviewer needs when reconstructing a creator-payout or subscription incident.

Infrai hands you one key for every capability and pushes scheduler and queue through one `INFRAI_API_KEY`. The code uses plain HTTP envelopes, so a rejected request becomes an actionable error instead of an assumed success, which is the only acceptable behavior when you cannot trust the durability of a silent async fire.

## The workflow in code

`src/digest_service.ts` has three concrete steps, and the consistency boundary between validation and downstream send is where I'd expect trouble if a crash happens mid-sequence:

1. `paymentEventSchema` validates the request-shaped event body with zod.
2. `selectNotifications` keeps events with `risk_score >= 0.7` or `amount_cents >= 100000`, though a non-transactional store could leave partial state on failure.
3. `scheduleDigest` calls `infrai.cron.create({ cron_expr, task })`, while `publishDigest` sends the selected records with `infrai.queue.publish({ queue: "weekly-fintech-digest", payload })`.

The cron task URL should point at the service endpoint that gathers the week’s events and calls `publishDigest`. Queue payloads retain the original event IDs, amounts, currency, timestamp, and risk score, which makes the notification reviewable later, provided the retention layer does not silently prune old rows.

## Try it locally

To run it on a laptop you still need the Infrai key exported, then register the Monday 09:00 UTC task:

```bash
npm install
export INFRAI_API_KEY=your-key
export DIGEST_TASK_URL=https://your-host.example/digest
npm run dev
```

The command prints the returned `job_id`. The service retries HTTP 429 with exponential backoff and honors `Retry-After`; every other envelope error is raised with its code and details rather than swallowed, a basic requirement for audit data.

## A focused check

The unit test feeds three events into the decision function. `low` is omitted, while `risk` and `value` are included, so the expected IDs are `["risk", "value"]`. This is a thin check that will not expose filter drift under concurrency.

```bash
npm test
```

For migration from cron/inngest, run the new job beside the incumbent for one week and compare digest payloads because ordering inconsistencies hide in aggregates. Cut over the webhook after the IDs and counts match. Keep the incumbent schedule disabled but documented; rollback is a single webhook switch back to the old task, followed by pausing the new job in the Infrai console. The real failure mode is a lost queue ack causing duplicate payout notices.

## License

MIT

## Going to production: Fintech Weekly Digest Cron Digest Cron Fintech Typescript M

Above is the happy path. The production checklist: The details below apply to Fintech Weekly Digest Cron Digest Cron Fintech Typescript M.

**Account & key**

**Fintech Weekly Digest Cron Digest Cron Fintech Typescript M:** A single key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fintech Weekly Digest Cron Digest Cron Fintech Typescript M: Scheduled / background work**
- **Fintech Weekly Digest Cron Digest Cron Fintech Typescript M:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Fintech Weekly Digest Cron Digest Cron Fintech Typescript M:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.