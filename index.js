import fs from 'fs';
<<<<<<< HEAD
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
=======
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits } from 'discord.js';
import { deploySlashCommands } from './utils/register.obf.js';
import { validatePremiumKey, runPremiumCommand } from './utils/bot.obf.js';
import { config, loadConfig } from './utils/config.js';
import { logError } from './utils/logger.js';
import { loadDB } from './utils/database.js';
import { safeReply } from './utils/helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadConfig();
loadDB();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');

let cachedPremiumValid = null;
async function checkPremium() {
  if (cachedPremiumValid !== null) return cachedPremiumValid;
  cachedPremiumValid = await validatePremiumKey();
  return cachedPremiumValid;
}

function validCmd(mod) {
  return mod && typeof mod.name === 'string' && typeof mod.execute === 'function';
}

async function loadCommands() {
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const mod = await import(`./commands/${file}?v=${Date.now()}`);
    if (validCmd(mod.default || mod)) {
      const commandModule = mod.default || mod;
      commands.set(commandModule.name, commandModule);
      console.log(`✅ Loaded command: ${commandModule.name}`);
    }
  }
}
await loadCommands();

await deploySlashCommands(commands);

fs.watch(commandsPath, async (eventType, filename) => {
  if (!filename || !filename.endsWith('.js')) return;
  try {
    const mod = await import(`./commands/${filename}?v=${Date.now()}`);
    const commandModule = mod.default || mod;
    if (validCmd(commandModule)) {
      commands.set(commandModule.name, commandModule);
      console.log(`🔄 Reloaded command: ${commandModule.name}`);
    }
  } catch (e) {
    console.error('Command reload error:', e);
  }
});

client.once('clientReady', () => {
  console.log(`[💻]      AMUZHA       [💻]`);
  console.log(`[🌐]  muzhaffar.my.id  [🌐]`);
  console.log(`✅ Bot is active as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const cmd = commands.get(commandName) ||
    Array.from(commands.values()).find(c => c.aliases?.includes(commandName));
  if (!cmd) return;

  try {
    if (cmd.premium) {
      const valid = await checkPremium();
      if (!valid) return message.reply('❌ Premium API key invalid. Command cannot run.');

      const result = await runPremiumCommand(commandName, args);
      if (!result.success) return message.reply(`❌ ${result.error}`);

      await cmd.execute(message, args, client, commands);
    } else {
      await cmd.execute(message, args, client, commands);
    }
  } catch (err) {
    logError(err);
    message.reply('❌ An error occurred, check the logs.');
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    if (cmd.premium || cmd.slow) {
      if (!interaction.deferred && !interaction.replied) await interaction.deferReply();
    }

    const args = interaction.options.data.map(opt => opt.value);

    if (cmd.premium) {
      const result = await runPremiumCommand(interaction.commandName, args);
      if (!result.success) return await safeReply(interaction, result.error);
    }

    await cmd.execute(interaction, args, client, commands);
  } catch (err) {
    logError(err);
    if (!interaction.replied) {
      await interaction.followUp({ content: '❌ An error occurred, check the logs.', flags: 64 });
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
    for (const cmd of commands.values()) {
      try {
        if (interaction.isStringSelectMenu() && typeof cmd.handleSelect === 'function') {
          const handled = await cmd.handleSelect(interaction);
          if (handled) return;
        }
        if (interaction.isModalSubmit() && typeof cmd.handleModal === 'function') {
          const handled = await cmd.handleModal(interaction);
          if (handled) return;
        }
      } catch (err) {
        logError(err);
        if (!interaction.replied) {
          await interaction.reply({ content: '❌ An error occurred, check the logs.', flags: 64 });
        }
      }
    }
  }
});

process.on('uncaughtException', (err) => logError(err));
process.on('unhandledRejection', (reason, promise) => logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`));

client.login(config.token).catch(err => console.error('❌ Failed to log in:', err));
>>>>>>> 026f649 (Clean commit)
