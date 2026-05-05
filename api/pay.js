import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { product, nick } = req.body;

  if (!product || !nick) {
    return res.status(422).json({ error: "Неверные данные" });
  }

  try {
    // Получаем секретные ключи из переменных окружения Vercel
    const LAVA_SHOP_ID = process.env.LAVA_SHOP_ID;
    const LAVA_SECRET_KEY = process.env.LAVA_SECRET_KEY;

    if (!LAVA_SHOP_ID || !LAVA_SECRET_KEY) {
      return res.status(500).json({ error: "Секретные ключи не настроены" });
    }

    // Формируем параметры для Lava
    const params = {
      shopId: LAVA_SHOP_ID,
      amount: productPrice(product), // функция ниже
      currency: "RUB",
      productName: product,
      customFields: nick,
    };

    // Формируем подпись
    const signatureString = `${params.shopId}:${params.amount}:${params.currency}:${params.productName}:${LAVA_SECRET_KEY}`;
    const signature = crypto.createHash("sha256").update(signatureString).digest("hex");

    // Возвращаем клиенту ссылку для оплаты
    res.status(200).json({
      success: true,
      payUrl: `https://pay.lava.ru/checkout?shopId=${params.shopId}&amount=${params.amount}&currency=${params.currency}&productName=${encodeURIComponent(params.productName)}&customFields=${encodeURIComponent(nick)}&signature=${signature}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
}

// Функция возвращает сумму по выбранному продукту
function productPrice(product) {
  switch(product.toUpperCase()) {
    case "IMPERATOR": return 499;
    case "KING": return 199;
    case "PRINCE": return 99;
    case "NOOB": return 49;
    default: return 0;
  }
}
