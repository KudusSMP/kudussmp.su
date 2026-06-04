import { Rcon } from 'rcon-client';

const RCON_HOST = process.env.RCON_HOST;
const RCON_PORT = Number(process.env.RCON_PORT || 25575);
const RCON_PASSWORD = process.env.RCON_PASSWORD;

const commands = {
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob',

  TITLE_PVP: 'lp user {nick} meta setsuffix 100 "&f[ПВП]"',
  TITLE_BATYA: 'lp user {nick} meta setsuffix 100 "&f[Батя]"',
  TITLE_CHSV: 'lp user {nick} meta setsuffix 100 "&f[ЧСВ!]"',
  TITLE_MACE: 'lp user {nick} meta setsuffix 100 "&f[Mace]"',
  TITLE_MYAU: 'lp user {nick} meta setsuffix 100 "&f[Мяу]"',
  TITLE_KIS: 'lp user {nick} meta setsuffix 100 "&f[Кис]"',
  TITLE_BDSM: 'lp user {nick} meta setsuffix 100 "&f[БДСМ]"',
  TITLE_LOH: 'lp user {nick} meta setsuffix 100 "&f[Лох]"',
  TITLE_JUDE: 'lp user {nick} meta setsuffix 100 "&f[JUDE]"',
  TITLE_TRAP: 'lp user {nick} meta setsuffix 100 "&f[Трап]"',
  TITLE_KEK: 'lp user {nick} meta setsuffix 100 "&f[Кек]"',
  TITLE_0IQ: 'lp user {nick} meta setsuffix 100 "&f[0iq]"'
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

    const status = String(body.status || body.invoiceStatus || body.paymentStatus || '').toLowerCase();

    if (
      status &&
      !['success', 'paid', 'completed', 'succeeded'].includes(status)
    ) {
      return res.status(200).send('payment not completed');
    }

    let customFields = body.customFields;

    if (typeof customFields === 'string') {
      customFields = JSON.parse(customFields);
    }

    const product = customFields?.product;
    const nick = customFields?.nick;

    if (!product || !nick) {
      return res.status(400).send('Нет product или nick');
    }

    const commandTemplate = commands[product];

    if (!commandTemplate) {
      return res.status(400).send('Неизвестный товар');
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

    return res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}
