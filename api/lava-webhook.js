// тестовый ответ для сайта GitHub Pages
export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Webhook получен:', req.body);
    res.status(200).json({ message: 'Webhook получен!' });
  } else {
    res.status(405).json({ message: 'Метод не поддерживается' });
  }
}
