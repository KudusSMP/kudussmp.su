// /api/lava-webhook.js
import { Rcon } from "rcon-client";
import bodyParser from "body-parser";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const { order_id, status } = req.body;

    if (!status || status !== "success") {
      return res.status(400).send("Payment not successful");
    }

    // Разбираем order_id: ROLE-NICK-<timestamp>
    const [role, nick] = order_id.split("-");

    const commands = {
      NOOB: "lp user {nick} parent set noob",
      PRINCE: "lp user {nick} parent set prince",
      KING: "lp user {nick} parent set king",
      IMPERATOR: "lp user {nick} parent set imperator"
    };

    if (!commands[role]) return res.status(400).send("Unknown product");

    // Подключаемся к Minecraft серверу через RCON
    const rcon = await Rcon.connect({
      host: process.env.RCON_HOST,
      port: Number(process.env.RCON_PORT),
      password: process.env.RCON_PASSWORD
    });

    const command = commands[role].replace("{nick}", nick);
    await rcon.send(command);
    await rcon.end();

    console.log(`Выдан ${role} игроку ${nick}`);
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Server error");
  }
}
