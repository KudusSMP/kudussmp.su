import { Rcon } from 'rcon-client';
​
const RCON_HOST = process.env.RCON_HOST;
const RCON_PORT = Number(process.env.RCON_PORT || 25575);
const RCON_PASSWORD = process.env.RCON_PASSWORD;
​
const commands = {
  TITAN: 'lp user {nick} parent set titan',
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob',
​
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
​
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
​
function parseOrderId(body) {
  const raw =
    body?.orderId ||
    body?.order_id ||
    body?.invoice?.orderId ||
    body?.invoice?.order_id ||
    body?.data?.orderId ||
    body?.data?.order_id;
  if (!raw || typeof raw !== 'string') return null;
​
  // We create orderId as: `${product}-${nick}-${Date.now()}`
  // product can contain underscores; nick can't contain '-'
  const parts = raw.split('-');
  if (parts.length < 3) return null;
  const ts = parts[parts.length - 1];
  const nick = parts[parts.length - 2];
  const product = parts.slice(0, -2).join('-');
  if (!product || !nick) return null;
  return { product, nick, ts, raw };
}
​
export default async function handler(req, res) {
  try {
if (req.method === 'GET') {
​
  const product = 'NOOB';
  const nick = 'proverka2';
​
  const commandTemplate = commands[product];
  const command = commandTemplate.replace('{nick}', nick);
​
  const rcon = await Rcon.connect({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD
  });
​
  await rcon.send(command);
  await rcon.end();
​
  return res.status(200).send('Тестовая выдача выполнена');
}
​
    const body = req.body;
​
    console.log('Lava webhook:', body);
​
    const status = String(body.status || body.invoiceStatus || body.paymentStatus || '').toLowerCase();
​
    if (
      status &&
      !['success', 'paid', 'completed', 'succeeded'].includes(status)
    ) {
      return res.status(200).send('payment not completed');
    }
​
    const customFields = parseCustomFields(body);
    const orderParsed = parseOrderId(body);
​
    // Prefer customFields; fallback to orderId parsing (more reliable for Lava)
    const product = customFields?.product || orderParsed?.product;
    const nick = customFields?.nick || orderParsed?.nick;
    const tokens = Number(customFields?.tokens || 0);
​
    if (!product || !nick) {
      return res.status(400).send('Нет product или nick (customFields/orderId)');
    }
​
    let command = '';
​
    if (product === 'TOKENS_CUSTOM') {
      // Give SMP-coins via plugin command
      // If tokens not provided by customFields, infer from amount in rubles.
      const amountRaw =
        body?.amount ||
        body?.sum ||
        body?.invoiceAmount ||
        body?.invoice_sum ||
        body?.data?.amount ||
        body?.data?.sum;
      const amount = Math.floor(Number(amountRaw || 0));
​
      const inferred = amount > 0 ? amount * 10 : 0;
      const toGive = Math.max(150, Math.floor(tokens || inferred || 0));
​
      if (!toGive) {
        return res
          .status(400)
          .send('Не указано количество токенов (и не удалось вывести из суммы)');
      }
​
      command = `ktoken give ${nick} ${toGive}`;
    } else {
      const commandTemplate = commands[product];
      if (!commandTemplate) {
        return res.status(400).send('Неизвестный товар');
      }
      command = commandTemplate.replace('{nick}', nick);
    }
​
    const rcon = await Rcon.connect({
      host: RCON_HOST,
      port: RCON_PORT,
      password: RCON_PASSWORD
    });
​
    await rcon.send(command);
    await rcon.end();
​
    console.log(
      product === 'TOKENS_CUSTOM'
        ? `Выданы SMP-коины: ${tokens || 'n/a'} игроку ${nick} (orderId: ${orderParsed?.raw || 'n/a'})`
        : `Выдан донат: ${product} игроку ${nick} (orderId: ${orderParsed?.raw || 'n/a'})`,
    );
​
    return res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}
​
