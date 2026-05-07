document.getElementById('buyBtn').addEventListener('click', () => {
  const nick = document.getElementById('nick').value;
  const product = document.getElementById('product').value;

  if(!nick) {
    document.getElementById('status').innerText = 'Введите ник игрока';
    return;
  }

  // Отправляем на Webhook плагина Minecraft
  fetch(`https://kudussmp.su/api/lava-webhook.js`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: `${product}-${nick}-${Date.now()}`,
      status: 'success',
      product: product,
      nick: nick,
      amount: 0  // тестовая сумма
    })
  })
  .then(res => res.text())
  .then(data => {
    document.getElementById('status').innerText = 'Привилегия успешно отправлена!';
  })
  .catch(err => {
    console.error(err);
    document.getElementById('status').innerText = 'Ошибка при отправке привилегии';
  });
});
