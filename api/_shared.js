function json(res, status, obj) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve(null);
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function requireSecret(req) {
  const secret = process.env.PAYOUT_SECRET;
  const got = req.query?.secret || req.headers["x-payout-secret"];
  if (!secret) throw new Error("Missing PAYOUT_SECRET env");
  if (!got || String(got) !== String(secret)) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
}

function normalizeStatus(body) {
  return String(body?.status || body?.invoiceStatus || body?.paymentStatus || "").toLowerCase();
}

function parseOrderId(body) {
  const raw =
    body?.orderId ||
    body?.order_id ||
    body?.invoice?.orderId ||
    body?.invoice?.order_id ||
    body?.data?.orderId ||
    body?.data?.order_id;

  if (!raw || typeof raw !== "string") return null;

  const parts = raw.split("-");
  if (parts.length < 3) return null;
  const ts = parts[parts.length - 1];
  const nick = parts[parts.length - 2];
  const product = parts.slice(0, -2).join("-");
  if (!product || !nick) return null;
  return { raw, product, nick, ts };
}

function parseAmountRub(body) {
  const amountRaw =
    body?.amount ||
    body?.sum ||
    body?.invoiceAmount ||
    body?.invoice_sum ||
    body?.data?.amount ||
    body?.data?.sum;

  const n = Number(amountRaw);
  if (!Number.isFinite(n)) return 0;
  return Math.floor(n);
}

export { json, readBody, requireSecret, normalizeStatus, parseOrderId, parseAmountRub };
