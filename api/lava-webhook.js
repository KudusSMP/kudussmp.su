import { upstash, upstashPipeline } from "./_upstash.js";
import { json, readBody, normalizeStatus, parseOrderId, parseAmountRub } from "./_shared.js";

const ORDER_KEY = (orderId) => `payout:order:${orderId}`;
const PENDING_ZSET = "payout:pending"; // score = createdAtMs

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { ok: false, error: "Method not allowed" });
    }

    const body = req.body && Object.keys(req.body).length ? req.body : await readBody(req);
    if (!body) {
      return json(res, 400, { ok: false, error: "Empty body" });
    }

    console.log("Lava webhook:", body);

    const status = normalizeStatus(body);
    if (status && !["success", "paid", "completed", "succeeded"].includes(status)) {
      return json(res, 200, { ok: true, ignored: true, status });
    }

    const order = parseOrderId(body);
    if (!order) {
      return json(res, 400, { ok: false, error: "Missing/invalid orderId" });
    }

    const amountRub = parseAmountRub(body);
    const tokens = order.product === "TOKENS_CUSTOM" && amountRub > 0 ? amountRub * 10 : 0;

    const record = {
      orderId: order.raw,
      product: order.product,
      nick: order.nick,
      amountRub,
      tokens,
      status: "pending",
      createdAtMs: Date.now(),
      source: "lava",
      raw: body,
    };

    // idempotency: already processed?
    const exists = await upstash("EXISTS", ORDER_KEY(order.raw));
    if (exists === 1) {
      return json(res, 200, { ok: true, duplicate: true });
    }

    await upstashPipeline([
      ["SET", ORDER_KEY(order.raw), JSON.stringify(record)],
      ["ZADD", PENDING_ZSET, String(record.createdAtMs), order.raw],
    ]);

    return json(res, 200, { ok: true });
  } catch (e) {
    console.error(e);
    return json(res, e.statusCode || 500, { ok: false, error: e.message || String(e) });
  }
}
