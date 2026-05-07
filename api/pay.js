// /api/pay.js
export default async function handler(req, res) {
  try {
    // получаем параметры из URL
    const { product, nick } = req.query;

    if (!product || !nick) {
      return res.status(400).json({ error: "Missing product or nick" });
    }

    // здесь можно сделать проверку продукта и цены
    const prices = {
      IMPERATOR: 499,
      KING: 199,
      PRINCE: 99,
      NOOB: 49
    };

    const amount = prices[product.toUpperCase()];
    if (!amount) {
      return res.status(400).json({ error: "Invalid product" });
    }

    // формируем данные заказа
    const orderId = `${product}-${nick}-${Date.now()}`;

    // возвращаем на фронтенд
    return res.status(200).json({
      order_id: orderId,
      product,
      nick,
      amount,
      status: "created"
    });

  } catch (err) {
    console.error("PAY.JS ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
