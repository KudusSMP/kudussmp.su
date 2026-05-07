import fetch from 'node-fetch';

const WEBHOOKLOGGER_URL = 'http://d6.aurorix.net:19096'; // сюда адрес твоего сервера + порт WebhookLogger (обычно тот же, что игровой)
const WEBHOOKLOGGER_ENDPOINT = '/webhook'; // путь, который слушает плагин

const commands = {
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob'
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed');
    }

    const body = req.body;

    console.log('Lava webhook received:', body);

    const status = String(body.status || '').toLowerCase();
    if (status !== 'success') {
      return res.status(200).send('Payment not successful');
    }

    const orderId = body.order_id || body.orderId;
    if (!orderId) {
      return res.status(400).send('Missing order_id');
    }

    // Из order_id берём product и nick
    const parts = orderId.split('-');
    const product = parts[0];
    const nick = parts[1];

    if (!product || !nick) {
      return res.status(400).send('Invalid order_id format');
    }

    const commandTemplate = commands[product];
    if (!commandTemplate) {
      return res.status(400).send('Unknown product');
    }

    const command = commandTemplate.replace('{nick}', nick);

    // Отправляем POST на плагин WebhookLogger
    const payload = {
      type: 'command',
      command: command
    };

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

    console.log(`Command sent to server: ${command}`);
    return res.status(200).send('ok');

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send(error.message);
  }
}
