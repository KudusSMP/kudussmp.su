// api/pay.js
const { Rcon } = require('rcon-client');

const RCON_HOST = '45.12.71.8';
const RCON_PORT = 19096;
const RCON_PASSWORD = 'ParolyaNETY1488';

const privileges = {
  NOOB: ['/lp user %nick% parent set NOOB'],
  PRINCE: ['/lp user %nick% parent set PRINCE'],
  KING: ['/lp user %nick% parent set KING'],
  IMPERATOR: ['/lp user %nick% parent set IMPERATOR']
};

async function givePrivilege(nick, product){
  if(!privileges[product]) return console.log(`Привилегия ${product} не найдена`);
  const rcon = new Rcon({host:RCON_HOST,port:RCON_PORT,password:RCON_PASSWORD});
  try{
    await rcon.connect();
    console.log(`RCON подключен, выдаем ${product} игроку ${nick}`);
    for(const cmd of privileges[product]){
      const command = cmd.replace('%nick%',nick);
      const res = await rcon.send(command);
      console.log(`Выполнена команда: ${command} | Ответ сервера: ${res}`);
    }
    await rcon.end();
  } catch(err){console.error('Ошибка RCON:',err);}
}

module.exports={givePrivilege};
