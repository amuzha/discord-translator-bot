import fs from 'fs';
import { fork } from 'child_process';

let botProcess = null;

function startBot() {
  if (botProcess) {
    try { botProcess.kill(); } catch {}
    botProcess = null;
  }
  botProcess = fork('./bot.js');
  botProcess.on('exit', (code, signal) => {
    console.log(`bot.js exited (code=${code}, signal=${signal})`);
  });
  console.log('▶️ bot.js started (pid:', botProcess.pid, ')');
}

startBot();

const watchList = ['./bot.js'];
watchList.forEach(file => {
  fs.watch(file, { persistent: true }, (eventType) => {
    console.log(`🔄 ${file} changed (${eventType}), restarting bot...`);
    startBot();
  });
});

process.on('SIGUSR2', () => {
  console.log('SIGUSR2 received — restarting bot child');
  startBot();
});
