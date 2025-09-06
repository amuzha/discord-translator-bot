import { saveConfig, config } from '../utils/config.js';

export const name = 'setprefix';
export const description = 'Show the current bot prefix (info only)';

export const execute = async (message, args) => {
    if (!config.owners.includes(message.author.id)) {
        return message.reply('❌ You are not the bot owner.');
    }
    if (args.length < 1) return message.reply(`⚠️ Use: \`${config.prefix} <prefix>\``);

    const newPrefix = args[0];
    config.prefix = newPrefix;
    saveConfig();

    return message.reply(`✅ Prefix successfully changed to: \`${newPrefix}\``);
};
