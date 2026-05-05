import crypto from "crypto";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const data = req.body;

    const signature = req.headers["lava-signature"];
    if (!signature || signature !== process.env.LAVA_SECRET_KEY) {
      return res.status(422).json({ error: "Неверная подпись" });
    }

    const status = String(data.status || data.invoiceStatus || "").toLowerCase();
    if (!["success", "paid", "completed"].includes(status)) {
      return res.status(200).json({ error: "Оплата не завершена" });
    }

    let fields = data.customFields;
    if (typeof fields === "string") fields = JSON.parse(fields);

    const nick = fields?.nick;
    const product = fields?.product;

    if (!nick || !product) return res.status(400).json({ error: "Неверные данные" });

    const groups = { NOOB: "noob", PRINCE: "prince", KING: "king", IMPERATOR: "imperator" };
    const command = `lp user ${nick} parent add ${groups[product] || ""}`;

    // Отправляем команду на сервер через HTTP Requests
    const serverUrl = process.env.SERVER_HTTP_URL;
    const fetchRes = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command })
    });

    const result = await fetchRes.text();

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
