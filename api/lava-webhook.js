import fetch from 'node-fetch';

// URL сервера Aurorix с WebhookLogger
const WEBHOOKLOGGER_URL = 'http://d6.aurorix.net:19096';
const WEBHOOKLOGGER_ENDPOINT = '/webhook';

// Команды LuckPerms
const commands = {
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob'
};

export default async function handler(req, res) {
  try {
    // === Временный тест GET ===
    if (req.method === 'GET') {
      const product = 'NOOB';
      const nick = 'proverka2';
      const command = commands[product].replace('{nick}', nick);

      const payload = { type: 'command', command };

      await fetch(`${WEBHOOKLOGGER_URL}${WEBHOOKLOGGER_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

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

      const payload = { type: 'command', command };

      const response = await fetch(`${WEBHOOKLOGGER_URL}${WEBHOOKLOGGER_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('WebhookLogger error:', text);
        return res.status(500).send('Failed to send command to server');
      }

      console.log(`Выдан донат: ${product} игроку ${nick}`);
      return res.status(200).send('ok');
    }

    return res.status(405).send('Method not allowed');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send(error.message);
  }
}
