import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits } from 'discord.js';
import { config, loadConfig } from './utils/config.js';
import { loadDB, addUser } from './utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');

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
      console.log(`✅ Loaded TEST command: ${commandModule.name}`);
    }
  }
}

await loadCommands();

fs.watch(commandsPath, async (eventType, filename) => {
  if (!filename || !filename.endsWith('.js')) return;
  try {
    const mod = await import(`./commands/${filename}?v=${Date.now()}`);
    const commandModule = mod.default || mod;
    if (validCmd(commandModule)) {
      commands.set(commandModule.name, commandModule);
      console.log(`🔄 Reloaded TEST command: ${commandModule.name}`);
    }
  } catch (e) {
    console.error('Command reload error (TEST):', e);
  }
});

const db = loadDB();

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const cmd = commands.get(commandName) ||
              Array.from(commands.values()).find(c => c.aliases?.includes(commandName));

  if (!cmd) return;

  try {
    await cmd.execute(message, args, client, commands, db, config);
    addUser({ id: message.author.id, username: message.author.username });
  } catch (err) {
    console.error('❌ Error executing TEST command:', err);
    await message.reply('❌ An error occurred (TEST), check logs.');
  }
});

client.once('ready', () => {
  console.log(`💻 AMUZHA 💻`);
  console.log(`Visit my website muzhaffar.my.id`);
  console.log(`✅ TEST bot is active as ${client.user.tag}`);
  console.log('📊 Mock DB:', db);
});

client.login(config.token)
  .catch(err => console.error('❌ Failed to login TEST:', err));
