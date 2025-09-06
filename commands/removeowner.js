import { saveConfig, config } from '../utils/config.js';

export const name = 'removeowner';
export const aliases = ['ro'];
export const description = 'Remove one or more bot owners by Discord ID or user mention';

export const execute = async (message, args) => {
    if (!config.owners.includes(message.author.id)) {
        return message.reply('❌ You are not the bot owner.');
    }

    if (args.length < 1)
        return message.reply(`⚠️ Use: \`${config.prefix}removeowner <discord_id|@mention> [discord_id|@mention]\``);

    const removeOwners = args.map(arg => {
        const match = arg.match(/^<@!?(\d+)>$/);
        if (match) return match[1];
        if (/^\d+$/.test(arg)) return arg;
        return null;
    }).filter(Boolean);

    if (removeOwners.length === 0)
        return message.reply('⚠️ There is no valid user ID/mention.');

    const removed = [];
    for (const ownerId of removeOwners) {
        if (config.owners.includes(ownerId)) {
            config.owners = config.owners.filter(id => id !== ownerId);
            removed.push(ownerId);
        }
    }

    if (removed.length === 0)
        return message.reply('⚠️ No owner was deleted, maybe the ID is not registered yet.');

    saveConfig();
    return message.reply(`✅ Owner **${removed.join('**, **')}** was successfully removed.`);
};
