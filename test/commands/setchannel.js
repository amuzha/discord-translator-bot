export default {
  name: 'setchannel',
  description: 'Set channel for guild language (testing)',
  aliases: ['sc'],
  async execute(message, args, client, commands, db = null) {
    if (!db) return await message.reply('❌ Mock DB is not available.');
    if (args.length < 2) return await message.reply('❌ Format: setchannel <lang_code> <channelID>');

    const langCode = args.shift();
    const channelId = args.shift();

    const channel = client.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) return await message.reply('❌ Invalid channel.');

    let guild = db.guilds.find(g => g.id === message.guildId);
    if (!guild) {
      guild = { id: message.guildId, languages: {} };
      db.guilds.push(guild);
    }
    guild.languages[langCode] = guild.languages[langCode] || { channels: [], title: langCode };
    if (!guild.languages[langCode].channels.includes(channelId)) {
      guild.languages[langCode].channels.push(channelId);
    }

    await message.reply(`✅ The channel for the language ${langCode} is set to: ${channel.name}`);
  }
};
