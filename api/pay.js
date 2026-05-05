import crypto from "crypto";

export default async function handler(req, res) {
  const { product } = req.query;

  const prices = {
    NOOB: 49,
    PRINCE: 99,
    KING: 199,
    IMPERATOR: 499,
  };

  if (!prices[product]) {
    return res.status(400).send("Неверный товар");
  }

  const shopId = process.env.LAVA_SHOP_ID;
  const secretKey = process.env.LAVA_SECRET_KEY;

  const orderId = Date.now().toString();
  const sum = prices[product].toFixed(2);

  const signString = `${shopId}:${sum}:${orderId}:${secretKey}`;
  const signature = crypto.createHash("md5").update(signString).digest("hex");

  try {
    const response = await fetch("https://api.lava.ru/business/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shopId,
        sum,
        orderId,
        signature,
        comment: product,
        successUrl: "https://www.kudussmp.su/success.html",
        failUrl: "https://www.kudussmp.su/fail.html",
      }),
    });

    const data = await response.json();

    if (data?.data?.url) {
      return res.redirect(data.data.url);
    } else {
      return res.status(500).json(data);
    }
  } catch (err) {
    return res.status(500).send("Ошибка сервера");
  }
}
