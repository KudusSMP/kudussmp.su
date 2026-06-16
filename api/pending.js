import { upstash, upstashPipeline } from "./_upstash.js";
import { json, requireSecret } from "./_shared.js";

const ORDER_KEY = (orderId) => `payout:order:${orderId}`;
const PENDING_ZSET = "payout:pending";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return json(res, 405, { ok: false, error: "Method not allowed" });
    }

    requireSecret(req);

    const limit = Math.min(50, Math.max(1, Number(req.query?.limit || 20)));
    const orderIds = await upstash("ZRANGE", PENDING_ZSET, "0", String(limit - 1));

    if (!orderIds || orderIds.length === 0) {
      return json(res, 200, { ok: true, items: [] });
    }

    const cmds = orderIds.map((id) => ["GET", ORDER_KEY(id)]);
    const results = await upstashPipeline(cmds);

    const items = [];
    for (let i = 0; i < orderIds.length; i++) {
      const raw = results[i];
      if (!raw) continue;
      try {
        items.push(JSON.parse(raw));
      } catch {}
    }

    return json(res, 200, { ok: true, items });
  } catch (e) {
    console.error(e);
    return json(res, e.statusCode || 500, { ok: false, error: e.message || String(e) });
  }
}
