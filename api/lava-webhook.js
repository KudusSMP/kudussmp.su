import { Rcon } from 'rcon-client';

const RCON_HOST = process.env.RCON_HOST;
const RCON_PORT = Number(process.env.RCON_PORT);
const RCON_PASSWORD = process.env.RCON_PASSWORD;

const commands = {
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const body = req.body;

  if (!body || !body.order_id || !body.status || body.status !== 'success') {
    return res.status(400).send('Invalid payload');
  }

  const [product, nick] = body.order_id.split('-');

  if (!commands[product]) return res.status(400).send('Unknown product');

  try {
    const rcon = await Rcon.connect({
      host: RCON_HOST,
      port: RCON_PORT,
      password: RCON_PASSWORD
    });

    const cmd = commands[product].replace('{nick}', nick);
    await rcon.send(cmd);
    await rcon.end();

    return res.status(200).send('OK');
  } catch (err) {
    console.error('RCON error:', err);
    return res.status(500).send('RCON error');
  }
}
