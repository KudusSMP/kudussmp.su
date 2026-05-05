import crypto from "crypto";

const PRODUCTS = {
  NOOB: { sum: 49, title: "NOOB" },
  PRINCE: { sum: 99, title: "PRINCE" },
  KING: { sum: 199, title: "KING" },
  IMPERATOR: { sum: 499, title: "IMPERATOR" },
};

export default async function handler(req, res) {
  try {
    const product = String(req.query.product || "").toUpperCase();
    const nick = String(req.query.nick || "").trim();
    const item = PRODUCTS[product];

    if (!item) {
      return res.status(400).send("Неверная привилегия");
    }

    if (!/^[a-zA-Z0-9_]{3,16}$/.test(nick)) {
      return res.status(400).send("Неверный Minecraft ник");
    }

    const shopId = process.env.LAVA_SHOP_ID;
    const secretKey = process.env.LAVA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return res.status(500).send("Не настроены ключи Lava");
    }

    const data = {
      sum: item.sum,
      orderId: `${product}-${nick}-${Date.now()}`,
      shopId: shopId,
      hookUrl: "https://www.kudussmp.su/api/webhook",
      successUrl: "https://www.kudussmp.su",
      failUrl: "https://www.kudussmp.su",
      expire: 300,
      comment: `KudusSMP ${item.title} для ${nick}`,
      customFields: JSON.stringify({
        product: product,
        nick: nick,
        server: "KudusSMP",
      }),
    };

    const body = JSON.stringify(data);

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(body)
      .digest("hex");

    const response = await fetch("https://api.lava.ru/business/invoice/create", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Signature: signature,
      },
      body: body,
    });

    const result = await response.json();

    const payUrl =
      result?.data?.url ||
      result?.data?.paymentUrl ||
      result?.data?.payUrl;

    if (!payUrl) {
      return res.status(500).json(result);
    }

    return res.redirect(payUrl);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}
