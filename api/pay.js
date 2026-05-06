import crypto from 'crypto';

const SHOP_ID = '43a149e1-a7ed-4b96-973b-43a446237377';

// Секретный ключ НЕ вставляй в код.
// Добавь его в Vercel: Settings → Environment Variables → LAVA_SECRET_KEY
const SECRET_KEY = process.env.LAVA_SECRET_KEY;

const SITE_URL = 'https://kudussmp.su';

const prices = {
  IMPERATOR: 499,
  KING: 199,
  PRINCE: 99,
  NOOB: 49
};

function makeSignature(jsonString) {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(jsonString)
    .digest('hex');
}

export default async function handler(req, res) {
  try {
    const { product, nick } = req.query;

    if (!product || !nick) {
      return res.status(400).send('Не указан товар или ник');
    }

    const amount = prices[product];

    if (!amount) {
      return res.status(400).send('Неизвестный товар');
    }

    if (!SECRET_KEY) {
      return res.status(500).send('Не задан LAVA_SECRET_KEY в Vercel');
    }

    const orderId = `${product}-${nick}-${Date.now()}`;

    const body = {
      sum: amount,
      orderId: orderId,
      shopId: SHOP_ID,
      successUrl: `${SITE_URL}`,
      failUrl: `${SITE_URL}`,
      comment: `KudusSMP: ${product}, ник: ${nick}`,
      customFields: JSON.stringify({
        product: product,
        nick: nick
      })
    };

    const jsonString = JSON.stringify(body);
    const signature = makeSignature(jsonString);

    const response = await fetch('https://api.lava.ru/business/invoice/create', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Signature': signature
      },
      body: jsonString
    });

    const data = await response.json();

    console.log('Lava response:', data);

    const paymentUrl =
      data?.data?.url ||
      data?.data?.paymentUrl ||
      data?.data?.link ||
      data?.url;

    if (!paymentUrl) {
      return res.status(500).send(`
        <h1>Ошибка Lava</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `);
    }

    return res.redirect(paymentUrl);
  } catch (error) {
    console.error(error);

    return res.status(500).send(`
      <h1>Ошибка сервера</h1>
      <pre>${error.message}</pre>
    `);
  }
}
