import fetch from "node-fetch"; // убедись, что установлен
import crypto from "crypto";

// Секретный ключ Lava (Environment Variable)
const LAVA_SECRET_KEY = process.env.LAVA_SECRET_KEY;

// URL для HTTP Requests на сервере Minecraft
const SERVER_HTTP_URL = process.env.SERVER_HTTP_URL; // пример: http://IP_СЕРВЕРА:PORT/execute

// Названия групп для выдачи
const GROUPS = {
  NOOB: "noob",
  PRINCE: "prince",
  KING: "king",
  IMPERATOR: "imperator"
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const data = req.body;

    // Проверка подписи Lava
    const signature = req.headers["lava-signature"];
    if (!signature || signature !== LAVA_SECRET_KEY) {
      return res.status(422).json({ error: "Неверная подпись" });
    }

    // Проверка статуса оплаты
    const status = String(data.status || data.invoiceStatus || "").toLowerCase();
    if (!["success", "paid", "completed"].includes(status)) {
      return res.status(200).json({ error: "Оплата не завершена" });
    }

    // Получаем ник игрока и продукт
    const fields = data.customFields;
    let nick = "";
    let product = "";

    if (typeof fields === "string") {
      const parsed = JSON.parse(fields);
      nick = parsed.nick;
      product = parsed.product;
    } else if (typeof fields === "object") {
      nick = fields.nick;
      product = fields.product;
    }

    if (!nick || !product || !GROUPS[product]) {
      return res.status(400).json({ error: "Неверные данные (ник или продукт)" });
    }

    // Отправка команды на сервер через HTTP Requests плагин
    const command = `lp user ${nick} parent add ${GROUPS[product]}`;
    const response = await fetch(SERVER_HTTP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command })
    });

    const result = await response.text();

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
