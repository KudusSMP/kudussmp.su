import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { product, nick } = req.body;

  if (!product || !nick) {
    return res.status(422).json({ error: "Нужно указать product и nick" });
  }

  // Привязка цен к продуктам
  const products = {
    NOOB: 49,
    PRINCE: 99,
    KING: 199,
    IMPERATOR: 499,
  };

  const amount = products[product];
  if (!amount) {
    return res.status(422).json({ error: "Продукт не найден" });
  }

  const orderId = `${product}_${nick}_${Date.now()}`; // уникальный ID заказа

  // Генерация подписи Lava
  const signatureString = `${process.env.LAVA_SHOP_ID};${amount};RUB;${orderId};${process.env.LAVA_SECRET_KEY}`;
  const signature = crypto.createHash("sha256").update(signatureString).digest("hex");

  // Формируем объект для Lava
  const payload = {
    shopId: process.env.LAVA_SHOP_ID,
    amount: amount,
    currency: "RUB",
    orderId: orderId,
    productName: product,
    nick: nick,
    signature: signature,
    successUrl: `${process.env.SITE_URL}?success=1`,
    failUrl: `${process.env.SITE_URL}?fail=1`,
  };

  // Возвращаем данные клиенту (чтобы он перенаправился на Lava)
  res.status(200).json(payload);
}
