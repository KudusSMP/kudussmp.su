import { Rcon } from 'rcon-client';

const RCON_HOST = process.env.RCON_HOST;          // IP сервера Aurorix
const RCON_PORT = Number(process.env.RCON_PORT);  // 25575
const RCON_PASSWORD = process.env.RCON_PASSWORD;  // Пароль RCON из server.properties

// Команды LuckPerms для разных рангов
const commands = {
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob'
};

export default async function handler(req, res) {
  try {
    // === Тестовый GET-запрос для проверки авто-выдачи ===
    if (req.method === 'GET') {
      const product = 'NOOB';
      const nick = 'proverka2'; // Ник для теста
      const command = commands[product].replace('{nick}', nick);

      const rcon = await Rcon.connect({
        host: RCON_HOST,
        port: RCON_PORT,
        password: RCON_PASSWORD
      });

      await rcon.send(command);
      await rcon.end();

      console.log(`Тестовая выдача: ${product} игроку ${nick}`);
      return res.status(200).send('Тестовая выдача выполнена');
    }

    // === POST от Lava ===
    if (req.method === 'POST') {
      const body = req.body;

      const status = String(body.status || '').toLowerCase();
      if (status !== 'success') return res.status(200).send('Payment not successful');

      const orderId = body.order_id || body.orderId;
      if (!orderId) return res.status(400).send('Missing order_id');

      // Формат order_id: "NOOB-TestPlayer-<timestamp>"
      const parts = orderId.split('-');
      const product = parts[0];
      const nick = parts[1];

      if (!product || !nick) return res.status(400).send('Invalid order_id');

      const commandTemplate = commands[product];
      if (!commandTemplate) return res.status(400).send('Unknown product');

      const command = commandTemplate.replace('{nick}', nick);

      const rcon = await Rcon.connect({
        host: RCON_HOST,
        port: RCON_PORT,
        password: RCON_PASSWORD
      });

      await rcon.send(command);
      await rcon.end();

      console.log(`Выдан донат: ${product} игроку ${nick}`);
      return res.status(200).send('ok');
    }

    return res.status(405).send('Method not allowed');

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send(error.message);
  }
}
