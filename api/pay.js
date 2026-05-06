// /api/pay.js
export default async function handler(req, res) {
  // Разрешаем только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Разбираем тело запроса
  const { product, nick } = req.body;

  if (!product || !nick) {
    return res.status(400).json({ success: false, error: 'Missing product or nick' });
  }

  try {
    // Здесь можно подключить платёжную систему через Webhook API
    // Например, проверка подписи и статус оплаты
    // -------------------------------------------
    // const result = await somePaymentAPI.verifyPayment(req.body);
    // if (!result.valid) throw new Error('Invalid signature');
    // -------------------------------------------

    // Для теста просто возвращаем успешный результат
    const message = `Привилегия ${product} для игрока ${nick} успешно добавлена.`;

    return res.status(200).json({ success: true, result: message });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
