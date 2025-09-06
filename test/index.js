import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits } from 'discord.js';
import { config, loadConfig } from './utils/config.js';
import { loadDB, addUser } from './utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadConfig();

const isRealToken = config.token && config.token !== 'dummy-token-for-testing';

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

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const cmd = commands.get(commandName) ||
              Array.from(commands.values()).find(c => c.aliases?.includes(commandName));

  if (!cmd) return;

  try {
    await cmd.execute(message, args, client, commands, loadDB(), config);
    addUser({ id: message.author.id, username: message.author.username });
  } catch (err) {
    console.error('❌ Error executing TEST command:', err);
    await message.reply('❌ An error occurred (TEST), check logs.');
  }
});

const db = loadDB();

if (isRealToken) {
  client.once('ready', () => {
    console.log(`💻 AMUZHA 💻`);
    console.log(`Visit my website muzhaffar.my.id`);
    console.log(`✅ TEST bot is active as ${client.user.tag}`);
    console.log('📊 Mock DB:', db);

    setTimeout(() => {
      console.log('✅ Test completed — shutting down bot...');
      client.destroy().then(() => {
        console.log('✅ Bot destroyed — exiting process.');
        process.exit(0);
      }).catch(err => {
        console.error('❌ Error destroying client:', err);
        process.exit(1);
      });
    }, 3000);
  });

  client.login(config.token)
    .catch(err => {
      console.error('❌ Failed to login TEST:', err);
      process.exit(1);
    });
} else {
  console.log(`💻 AMUZHA 💻`);
  console.log(`Visit my website muzhaffar.my.id`);
  console.log(`⚠️ TEST mode: Using dummy token — bot will not login.`);
  console.log('📊 Mock DB:', db);
  console.log('✅ All TEST commands loaded successfully.');

  setTimeout(() => {
    console.log('✅ Test completed — exiting...');
    process.exit(0);
  }, 1000);
}