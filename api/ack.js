import { upstash, upstashPipeline } from "./_upstash.js";
import { json, readBody, requireSecret } from "./_shared.js";

const ORDER_KEY = (orderId) => `payout:order:${orderId}`;
const PENDING_ZSET = "payout:pending";
const DONE_ZSET = "payout:done";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { ok: false, error: "Method not allowed" });
    }

    requireSecret(req);

    const body = req.body && Object.keys(req.body).length ? req.body : await readBody(req);
    const orderId = body?.orderId;
    const ok = body?.ok !== false;
    const message = body?.message || null;

    if (!orderId) {
      return json(res, 400, { ok: false, error: "Missing orderId" });
    }

    const raw = await upstash("GET", ORDER_KEY(orderId));
    if (!raw) {
      return json(res, 200, { ok: true, missing: true });
    }

    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      record = { orderId };
    }

    record.status = ok ? "done" : "failed";
    record.ackAtMs = Date.now();
    record.ackMessage = message;

    await upstashPipeline([
      ["SET", ORDER_KEY(orderId), JSON.stringify(record)],
      ["ZREM", PENDING_ZSET, orderId],
      ["ZADD", DONE_ZSET, String(record.ackAtMs), orderId],
    ]);

    return json(res, 200, { ok: true });
  } catch (e) {
    console.error(e);
    return json(res, e.statusCode || 500, { ok: false, error: e.message || String(e) });
  }
}
