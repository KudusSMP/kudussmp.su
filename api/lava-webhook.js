import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// Словарь команд для ролей
const commands = {
  NOOB: "lp user {nick} parent set noob",
  PRINCE: "lp user {nick} parent set prince",
  KING: "lp user {nick} parent set king",
  IMPERATOR: "lp user {nick} parent set imperator"
};

// Вебхук от Lava
app.post("/api/lava-webhook", async (req, res) => {
  try {
    const { order_id, status } = req.body;

    if (status !== "success") {
      return res.status(400).send("Payment not successful");
    }

    // Получаем ник и роль из order_id
    // Формат order_id: ROLE-NICK
    const [role, nick] = order_id.split("-");

    if (!commands[role]) {
      return res.status(400).send("Invalid role");
    }

    // Отправка команды на сервер через WebhookLogger
    // WebhookLogger ожидает POST JSON:
    // { "command": "/lp user ...", "executor": "console" }
    const webhookUrl = "http://d6.aurorix.net:19096/webhook"; // Плагин WebhookLogger

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: commands[role].replace("{nick}", nick),
        executor: "console"
      })
    });

    return res.status(200).send("Role granted successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.listen(3000, () => {
  console.log("Lava Webhook Server running on port 3000");
});
