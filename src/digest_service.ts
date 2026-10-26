import { z } from "zod";
import { infrai } from "./infrai.js";

export const paymentEventSchema = z.object({
  event_id: z.string().min(1),
  account_id: z.string().min(1),
  amount_cents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  occurred_at: z.string().datetime(),
  risk_score: z.number().min(0).max(1)
});
export type PaymentEvent = z.infer<typeof paymentEventSchema>;

export function selectNotifications(events: PaymentEvent[]): PaymentEvent[] {
  return events.filter((event) => event.risk_score >= 0.7 || event.amount_cents >= 100000);
}

export async function scheduleDigest(taskUrl: string): Promise<string> {
  const result = await infrai.cron.create({ cron_expr: "0 9 * * 1", task: taskUrl });
  return result.job_id;
}

export async function publishDigest(events: unknown[]): Promise<void> {
  const parsed = events.map((event) => paymentEventSchema.parse(event));
  const notifications = selectNotifications(parsed);
  await infrai.queue.publish({ queue: "weekly-fintech-digest", payload: { kind: "weekly-fintech-digest", notifications } }, `digest-${notifications.map((item) => item.event_id).sort().join(",") || "empty"}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const taskUrl = process.env.DIGEST_TASK_URL ?? "https://example.com/fintech/digest";
  const jobId = await scheduleDigest(taskUrl);
  console.log(JSON.stringify({ scheduled: jobId, cron_expr: "0 9 * * 1", task: taskUrl }));
}
