import { Rcon } from 'rcon-client';

const RCON_HOST = process.env.RCON_HOST;
const RCON_PORT = Number(process.env.RCON_PORT || 25575);
const RCON_PASSWORD = process.env.RCON_PASSWORD;

const commands = {
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob'
};

export default async function handler(req, res) {
  try {
if (req.method === 'GET') {

  const product = 'NOOB';
  const nick = 'proverka2';

  const commandTemplate = commands[product];
  const command = commandTemplate.replace('{nick}', nick);

  const rcon = await Rcon.connect({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD
  });

  await rcon.send(command);
  await rcon.end();

  return res.status(200).send('Тестовая выдача выполнена');
}
    const body = req.body;

    console.log('Lava webhook:', body);

    const status = String(body.status || '').toLowerCase();

    if (status !== 'success') {
      return res.status(200).send('payment not success');
    }

    const orderId = body.order_id || body.orderId;

    if (!orderId) {
      return res.status(400).send('Нет order_id');
    }

    const parts = orderId.split('-');

    const product = parts[0];
    const nick = parts[1];

    if (!product || !nick) {
      return res.status(400).send('Ошибка чтения order_id');
    }

    const commandTemplate = commands[product];

    if (!commandTemplate) {
      return res.status(400).send('Неизвестный товар');
    }

    if (!RCON_HOST || !RCON_PORT || !RCON_PASSWORD) {
      return res.status(500).send('Не заданы RCON переменные в Vercel');
    }

    const command = commandTemplate.replace('{nick}', nick);

    const rcon = await Rcon.connect({
      host: RCON_HOST,
      port: RCON_PORT,
      password: RCON_PASSWORD
    });

    await rcon.send(command);
    await rcon.end();

    console.log(`Выдан донат: ${product} игроку ${nick}`);
    console.log(`Команда: ${command}`);

    return res.status(200).send('ok');
  } catch (error) {
    console.error('Webhook error:', error);

    return res.status(500).send(error.message);
  }
}
