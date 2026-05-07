import crypto from 'crypto';
import { Rcon } from 'rcon-client';

const SHOP_ID = '43a149e1-a7ed-4b96-973b-43a446237377';
const SECRET_KEY = process.env.LAVA_SECRET_KEY;
const SITE_URL = 'https://kudussmp.su';

// RCON конфиг
const RCON_HOST = process.env.RCON_HOST; // d6.aurorix.net
const RCON_PORT = Number(process.env.RCON_PORT); // 19096
const RCON_PASSWORD = process.env.RCON_PASSWORD; // ParolyaNETY1488

const prices = {
  IMPERATOR: 499,
  KING: 199,
  PRINCE: 99,
  NOOB: 49
};

const commands = {
  IMPERATOR: 'lp user {nick} parent set imperator',
  KING: 'lp user {nick} parent set king',
  PRINCE: 'lp user {nick} parent set prince',
  NOOB: 'lp user {nick} parent set noob'
};

export default async function handler(req, res) {
  const { product, nick } = req.query;

  if (!product || !nick || !prices[product]) {
    return res.status(400).send('Invalid parameters');
  }

  const amount = prices[product];

  // создаём данные для Lava (чтобы потом webhook пришёл)
  const data = {
    shopId: SHOP_ID,
    amount,
    nick,
    product
  };

  // Для теста можно вернуть JSON с данными для Lava
  return res.status(200).json({
    message: 'API работает',
    product,
    nick,
    amount
  });
}
