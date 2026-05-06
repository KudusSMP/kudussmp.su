import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешен' });
  }

  const { product, nick } = req.body;

  if (!product || !nick) {
    return res.status(400).json({ error: 'Не указан продукт или ник' });
  }

  // Переменные окружения (добавь их на Vercel)
  const LAVA_SHOP_ID = process.env.43a149e1-a7ed-4b96-973b-43a446237377;   // Ваш ID магазина
  const LAVA_SECRET_KEY = process.env.cad1602c7235a28258f9ee273a6f28f0c99095a9; // Ваш секретный ключ Lava
  const LAVA_API_URL = 'https://pay.lava.ru/api/v1/orders/create'; // API Lava

  if (!LAVA_SHOP_ID || !LAVA_SECRET_KEY) {
    return res.status(500).json({ error: 'Не настроены переменные окружения Lava' });
  }

  // Настройка цены по продукту
  const prices = {
    'IMPERATOR': 499,
    'KING': 199,
    'PRINCE': 99,
    'NOOB': 49
  };

  const amount = prices[product];
  if (!amount) {
    return res.status(400).json({ error: 'Неверный продукт' });
  }

  // Формируем payload для Lava
  const payload = {
    shop_id: Number(LAVA_SHOP_ID),
    amount: amount,
    currency: 'RUB',
    product: product,
    nick: nick
  };

  // Генерация подписи HMAC
  const signature = crypto
    .createHmac('sha256', LAVA_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  payload.signature = signature;

  try {
    const lavaRes = await fetch(LAVA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await lavaRes.json();

    if (result.success) {
      return res.status(200).json({ success: true, result });
    } else {
      return res.status(400).json({ success: false, error: result.error || 'Ошибка Lava' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка соединения с Lava' });
  }
}
