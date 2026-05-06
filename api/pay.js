import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не разрешен' });

  const { product, nick } = req.body;
  if (!product || !nick) return res.status(400).json({ error: 'Не передан продукт или ник' });

  try {
    const LAVA_SHOP_ID = process.env.LAVA_SHOP_ID;        // Ваш ID магазина
    const LAVA_SECRET_KEY = process.env.LAVA_SECRET_KEY;  // Секретный ключ
    const priceMap = { IMPERATOR: 499, KING: 199, PRINCE: 99, NOOB: 49 };
    const amount = priceMap[product];
    if (!amount) return res.status(400).json({ error: 'Неизвестный продукт' });

    const payload = {
      amount,
      currency: 'RUB',
      product,
      nick,
    };

    // Генерация подписи
    const signature = crypto
      .createHmac('sha256', LAVA_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    payload.signature = signature;
    payload.shop_id = LAVA_SHOP_ID;

    // Отправка на Lava
    const response = await fetch('https://api.lava.ru/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 'success') {
      return res.status(200).json({ success: true, result: `${product} куплен успешно` });
    } else {
      return res.status(400).json({ success: false, error: result.error || 'неизвестная ошибка' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
}
