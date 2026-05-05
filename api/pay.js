import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const { amount, comment } = req.query;

    const allowed = {
      "49": "NOOB",
      "99": "PRINCE",
      "199": "KING",
      "499": "IMPERATOR",
    };

    if (!allowed[amount] || allowed[amount] !== comment) {
      return res.status(400).send("Неверная привилегия или сумма");
    }

    const orderId = `${comment}-${Date.now()}`;
    const shopId = process.env.LAVA_SHOP_ID;
    const secret = process.env.LAVA_SECRET_KEY;

    const data = {
      sum: Number(amount),
      orderId,
      shopId,
      successUrl: "https://www.kudussmp.su",
      failUrl: "https://www.kudussmp.su",
      comment: `KudusSMP ${comment}`,
    };

    const sorted = Object.keys(data)
      .sort()
      .reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {});

    const signature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(sorted))
      .digest("hex");

    const response = await fetch("https://api.lava.ru/business/invoice/create", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Signature": signature,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    const payUrl =
      result?.data?.url ||
      result?.data?.payUrl ||
      result?.data?.paymentUrl ||
      result?.url;

    if (!payUrl) {
      console.log(result);
      return res.status(500).json(result);
    }

    return res.redirect(payUrl);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}
