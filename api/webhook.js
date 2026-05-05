import { Rcon } from "rcon-client";

const GROUPS = {
  NOOB: "noob",
  PRINCE: "prince",
  KING: "king",
  IMPERATOR: "imperator",
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method not allowed");
    }

    const data = req.body;

    // Проверяем статус оплаты
    const status = String(data.status || data.invoiceStatus || "").toLowerCase();

    if (!["success", "paid", "completed"].includes(status)) {
      return res.status(200).send("Payment not completed");
    }

    // Достаём данные
    let fields = data.customFields;

    if (typeof fields === "string") {
      fields = JSON.parse(fields);
    }

    const product = String(fields?.product || "").toUpperCase();
    const nick = String(fields?.nick || "").trim();

    if (!GROUPS[product] || !nick) {
      return res.status(400).send("Missing product or nick");
    }

    // Проверка ника
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(nick)) {
      return res.status(400).send("Invalid nickname");
    }

    // Подключение к серверу
    const rcon = await Rcon.connect({
      host: process.env.RCON_HOST,
      port: Number(process.env.RCON_PORT),
      password: process.env.RCON_PASSWORD,
    });

    // Выдача доната
    await rcon.send(`lp user ${nick} parent set ${GROUPS[product]}`);
    await rcon.end();

    return res.status(200).send("Privilege issued");
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}
