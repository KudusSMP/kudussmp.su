import crypto from 'crypto';

const SHOP_ID = '43a149e1-a7ed-4b96-973b-43a446237377';
const SECRET_KEY = process.env.LAVA_SECRET_KEY;
const SITE_URL = 'https://kudussmp.su';

const prices = {
  TITAN: 999,
  IMPERATOR: 499,
  KING: 199,
  PRINCE: 99,
  NOOB: 49,

  TITLE_PVP: 49,
  TITLE_BATYA: 69,
  TITLE_CHSV: 99,
  TITLE_MACE: 59,
  TITLE_MYAU: 19,
  TITLE_KIS: 19,
  TITLE_BDSM: 35,
  TITLE_LOH: 15,
  TITLE_JUDE: 59,
  TITLE_TRAP: 49,
  TITLE_KEK: 15,
  TITLE_0IQ: 29
};

function makeSignature(jsonString) {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(jsonString)
    .digest('hex');
}

export default async function handler(req, res) {
  const { product, nick } = req.query;

  if (!product || !nick) {
    return res.status(400).send('Не указан товар или ник');
  }

  const amount = prices[product];

  if (!amount) {
    return res.status(400).send('Неизвестный товар');
  }

  const orderId = `${product}-${nick}-${Date.now()}`;

  const body = {
    sum: amount,
    orderId,
    shopId: SHOP_ID,
    hookUrl: `${SITE_URL}/api/lava-webhook`,
    successUrl: SITE_URL,
    failUrl: SITE_URL,
    comment: `KudusSMP: ${product}, ник: ${nick}`,
    customFields: JSON.stringify({ product, nick })
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

  const paymentUrl =
    data?.data?.url ||
    data?.data?.paymentUrl ||
    data?.data?.link ||
    data?.url;

  if (!paymentUrl) {
    return res.status(500).send(JSON.stringify(data, null, 2));
  }

  return res.redirect(paymentUrl);
}
