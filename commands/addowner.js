import { config, saveConfig } from '../utils/config.js';

export const name = 'addowner';
export const description = 'Add one or more new bot owners by Discord ID or user mention';
export const aliases = ['owneradd'];

export async function execute(message, args) {
  if (!config.owners.includes(message.author.id)) {
    return message.reply('❌ You are not the bot owner.');
  }

  if (args.length < 1) 
    return message.reply(`⚠️ Use: \`${config.prefix}addowner <discord_id|@mention> [discord_id|@mention]\``);

  const newOwners = args.map(arg => {
    const match = arg.match(/^<@!?(\d+)>$/);
    if (match) return match[1];
    if (/^\d+$/.test(arg)) return arg;
    return null;
  }).filter(Boolean);

  if (newOwners.length === 0) 
    return message.reply('⚠️ No valid user ID/mention.');

  const added = [];
  for (const ownerId of newOwners) {
    if (!config.owners.includes(ownerId)) {
      config.owners.push(ownerId);
      added.push(ownerId);
    }
  }

  if (added.length === 0) 
    return message.reply('⚠️ All IDs entered are already owners.');

  saveConfig();
  return message.reply(`✅ ID **${added.join('**, **')}** was successfully added as owner.`);
}
