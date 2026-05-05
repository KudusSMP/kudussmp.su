import { Rcon } from "rcon-client";

const GROUPS = {
  NOOB: "noob",
  PRINCE: "prince",
  KING: "king",
  IMPERATOR: "imperator"
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method not allowed");
    }

    const data = req.body;
    console.log("WEBHOOK DATA:", data);

    // проверка статуса
    const status = String(
      data.status || data.invoiceStatus || ""
    ).toLowerCase();

    if (!["success", "paid", "completed"].includes(status)) {
      return res.status(200).send("Не оплачено");
    }

    // достаём customFields
    let fields = data.customFields;

    if (typeof fields === "string") {
      fields = JSON.parse(fields);
    }

    const nick = fields?.nick;
    const product = fields?.product;

    if (!nick || !product) {
      return res.status(400).send("Нет данных");
    }

    const group = GROUPS[product];
    if (!group) {
      return res.status(400).send("Нет группы");
    }

    // подключение к серверу
    const rcon = await Rcon.connect({
      host: process.env.RCON_HOST,
      port: Number(process.env.RCON_PORT),
      password: process.env.RCON_PASSWORD
    });

    // команда выдачи
    await rcon.send(`lp user ${nick} parent add ${group}`);
    await rcon.end();

    console.log(`Выдано: ${nick} -> ${group}`);

    res.status(200).send("OK");

  } catch (err) {
    console.log("WEBHOOK ERROR:", err);
    res.status(500).send("Ошибка");
  }
}
