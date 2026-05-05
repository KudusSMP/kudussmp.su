export default async function handler(req, res) {
  try {
    const { product, nick } = req.query;

    if (!product || !nick) {
      return res.status(400).send("Ошибка: нет продукта или ника");
    }

    // цены
    const prices = {
      NOOB: 49,
      PRINCE: 99,
      KING: 199,
      IMPERATOR: 499
    };

    const price = prices[product];
    if (!price) {
      return res.status(400).send("Неверный продукт");
    }

    const orderId = Date.now().toString();

    const body = {
      sum: price,
      orderId: orderId,
      shopId: process.env.LAVA_SHOP_ID,

      // ВАЖНО
      customFields: JSON.stringify({
        nick: nick,
        product: product
      }),

      hookUrl: "https://www.kudussmp.su/api/webhook"
    };

    const response = await fetch("https://api.lava.ru/business/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!data?.data?.url) {
      console.log("LAVA ERROR:", data);
      return res.status(500).send("Ошибка создания оплаты");
    }

    // редирект на оплату
    return res.redirect(data.data.url);

  } catch (err) {
    console.log("PAY ERROR:", err);
    res.status(500).send("Ошибка сервера");
  }
}
