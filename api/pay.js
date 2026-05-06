export default async function handler(req, res) {
  const { product, nick } = req.query;

  if (!product || !nick) {
    return res.status(400).send('Не указан товар или ник');
  }

  const prices = {
    IMPERATOR: 499,
    KING: 199,
    PRINCE: 99,
    NOOB: 49
  };

  const amount = prices[product];

  if (!amount) {
    return res.status(400).send('Неизвестный товар');
  }

  // Пока тестовая заглушка, чтобы проверить, что api/pay.js работает
  return res.status(200).send(`
    <h1>API работает</h1>
    <p>Товар: ${product}</p>
    <p>Ник: ${nick}</p>
    <p>Сумма: ${amount} ₽</p>
  `);
}
