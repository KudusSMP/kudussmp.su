export default async function handler(req, res) {
  const { product, nick } = req.query;

  // Проверка ника (Minecraft)
  if (!nick || !/^[a-zA-Z0-9_]{3,16}$/.test(nick)) {
    return res.status(400).send("Неверный Minecraft ник");
  }

  // Цены
  const prices = {
    NOOB: 49,
    PRINCE: 99,
    KING: 199,
    IMPERATOR: 499,
  };

  const amount = prices[product];

  if (!amount) {
    return res.status(400).send("Неверный товар");
  }

  // Создаем заказ в LAVA
  const response = await fetch("https://api.lava.ru/business/invoice/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      shopId: process.env.LAVA_SHOP_ID,
      amount: amount,
      orderId: Date.now().toString(),

      // 👇 ВАЖНО — передаём ник и группу
      customFields: JSON.stringify({
        nick: nick,
        group: product.toLowerCase(),
      }),

      successUrl: "https://kudussmp.su",
      failUrl: "https://kudussmp.su",
    }),
  });

  const data = await response.json();

  if (!data?.data?.url) {
    return res.status(500).json(data);
  }

  // Редирект на оплату
  res.redirect(data.data.url);
}
