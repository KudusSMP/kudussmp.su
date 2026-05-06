// api/pay.js
const express = require('express');
const { Rcon } = require('rcon-client');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Настройки сервера
const RCON_HOST = '45.12.71.8';         // IP твоего сервера
const RCON_PORT = 19096;                // Порт RCON
const RCON_PASSWORD = 'ParolyaNETY1488'; // Пароль RCON

// Команды для каждой привилегии
const privileges = {
  NOOB: [
    '/lp user %nick% parent set NOOB'
  ],
  PRINCE: [
    '/lp user %nick% parent set PRINCE'
  ],
  KING: [
    '/lp user %nick% parent set KING'
  ],
  IMPERATOR: [
    '/lp user %nick% parent set IMPERATOR'
  ]
};

// Функция выдачи привилегии
async function givePrivilege(nick, product) {
  if (!privileges[product]) {
    console.log(`Привилегия ${product} не найдена`);
    return;
  }

  const rcon = new Rcon({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD
  });

  try {
    await rcon.connect();
    console.log(`RCON: подключено, выдаем ${product} игроку ${nick}`);

    for (const cmd of privileges[product]) {
      const command = cmd.replace('%nick%', nick);
      const res = await rcon.send(command);
      console.log(`Команда: ${command} | Ответ сервера: ${res}`);
    }

    await rcon.end();
    console.log(`Привилегия ${product} успешно выдана ${nick}`);
  } catch (err) {
    console.error('Ошибка RCON:', err);
  }
}

// API для обработки оплаты
app.post('/api/pay', async (req, res) => {
  const { nick, product } = req.body;

  if (!nick || !product) {
    return res.status(400).json({ success: false, error: 'Нужны nick и product' });
  }

  try {
    await givePrivilege(nick, product);
    res.json({ success: true, result: `Привилегия ${product} выдана игроку ${nick}` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Ошибка при выдаче привилегии' });
  }
});

// Запуск сервера API
const PORT = 3000; // Можно поменять, если нужно
app.listen(PORT, () => {
  console.log(`Сервер API запущен на http://localhost:${PORT}`);
});
