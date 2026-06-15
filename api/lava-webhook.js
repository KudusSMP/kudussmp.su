import { Rcon } from 'rcon-client';

const RCON_HOST = process.env.RCON_HOST;
const RCON_PORT = Number(process.env.RCON_PORT || 25575);
const RCON_PASSWORD = process.env.RCON_PASSWORD;

const commands = {
  TITAN: 'lp user {nick} parent set titan',
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob',

  TITLE_PVP: 'lp user {nick} meta setsuffix 100 " &4ПВП &f"',
  TITLE_BATYA: 'lp user {nick} meta setsuffix 100 " &4Батя &f"',
  TITLE_CHSV: 'lp user {nick} meta setsuffix 100 " &4ЧСВ! &f "',
  TITLE_MACE: 'lp user {nick} meta setsuffix 100 " &d&lMace &f"',
  TITLE_MYAU: 'lp user {nick} meta setsuffix 100 " &bМяу &F"',
  TITLE_KIS: 'lp user {nick} meta setsuffix 100 " &eКис &F"',
  TITLE_BDSM: 'lp user {nick} meta setsuffix 100 " &1БДСМ &F"',
  TITLE_LOH: 'lp user {nick} meta setsuffix 100 " &cЛох &f"',
  TITLE_JUDE: 'lp user {nick} meta setsuffix 100 " &a&lJUDE &f"',
  TITLE_TRAP: 'lp user {nick} meta setsuffix 100 " &eТрап &f"',
  TITLE_KEK: 'lp user {nick} meta setsuffix 100 " &eКек &f"',
  TITLE_0IQ: 'lp user {nick} meta setsuffix 100 " &f0iq &f"'
};

function parseCustomFields(body) {
  let customFields = body?.customFields;
  if (!customFields) return null;
  if (typeof customFields === 'string') {
    try {
      return JSON.parse(customFields);
    } catch {
      return null;
    }
  }
  if (typeof customFields === 'object') return customFields;
  return null;
}

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

    const status = String(body.status || body.invoiceStatus || body.paymentStatus || '').toLowerCase();

    if (
      status &&
      !['success', 'paid', 'completed', 'succeeded'].includes(status)
    ) {
      return res.status(200).send('payment not completed');
    }

    const customFields = parseCustomFields(body);
    const product = customFields?.product;
    const nick = customFields?.nick;
    const tokens = Number(customFields?.tokens || 0);

    if (!product || !nick) {
      return res.status(400).send('Нет product или nick');
    }

    let command = '';

    if (product === 'TOKENS_CUSTOM') {
      // Give SMP-coins via plugin command
      const toGive = Math.max(150, Math.floor(tokens || 0));
      if (!toGive) {
        return res.status(400).send('Не указано количество токенов');
      }
      command = `ktoken give ${nick} ${toGive}`;
    } else {
      const commandTemplate = commands[product];
      if (!commandTemplate) {
        return res.status(400).send('Неизвестный товар');
      }
      command = commandTemplate.replace('{nick}', nick);
    }

    const rcon = await Rcon.connect({
      host: RCON_HOST,
      port: RCON_PORT,
      password: RCON_PASSWORD
    });

    await rcon.send(command);
    await rcon.end();

    console.log(
      product === 'TOKENS_CUSTOM'
        ? `Выданы SMP-коины: ${tokens} игроку ${nick}`
        : `Выдан донат: ${product} игроку ${nick}`,
    );

    return res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}
