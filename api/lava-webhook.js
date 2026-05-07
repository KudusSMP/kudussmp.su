import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { Rcon } from 'rcon-client';

const app = express();
app.use(bodyParser.json());

const RCON_HOST = process.env.RCON_HOST;        // IP сервера Minecraft
const RCON_PORT = Number(process.env.RCON_PORT); // порт RCON (например 25575)
const RCON_PASSWORD = process.env.RCON_PASSWORD;

const commands = {
  NOOB: 'lp user {nick} parent set noob',
  PRINCE: 'lp user {nick} parent set prince',
  KING: 'lp user {nick} parent set king',
  IMPERATOR: 'lp user {nick} parent set imperator'
};

app.post('/api/lava-webhook', async (req, res) => {
  try {
    const { order_id, status } = req.body;
    if (!status || status !== 'success') return res.status(400).send('Payment not success');

    // Ник из order_id
    const nick = order_id.split('-')[1].toLowerCase();  
    const rank = order_id.split('-')[0];              

    const rcon = await Rcon.connect({
      host: RCON_HOST,
      port: RCON_PORT,
      password: RCON_PASSWORD
    });

    await rcon.send(commands[rank].replace('{nick}', nick));
    await rcon.end();

    console.log(`Выдан ${rank} игроку ${nick}`);
    res.send({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error issuing rank');
  }
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));
