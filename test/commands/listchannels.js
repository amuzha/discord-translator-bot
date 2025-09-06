export default {
  name: 'listchannels',
  description: 'Showing all channels per language in guild (testing)',
  aliases: ['lc'],
  async execute(message, args, client, commands, db = null) {
    if (!db) return await message.reply('❌ Mock DB is not available.');
    if (!message.guild) return await message.reply('❌ This command can only be run on the server (guild).');

    const guildId = message.guild.id;
    const guild = db.guilds.find(g => g.id === guildId);

    if (!guild || !guild.languages || Object.keys(guild.languages).length === 0) {
      return await message.reply('⚠️ There are no languages ​​or channels set for this guild yet.');
    }

    let replyText = `[📌]=> List Channels Guild ${message.guild.name} <=[📌]\n`;

    for (const lang in guild.languages) {
      const langData = guild.languages[lang];
      replyText += `\n🌐 **${langData.title}** (${lang}):\n`;
      if (langData.channels.length === 0) {
        replyText += `  - No channels set\n`;
      } else {
        langData.channels.forEach((chId, idx) => {
          const ch = client.channels.cache.get(chId);
          const chName = ch?.name || 'Unknown';
          replyText += `  ${idx + 1}. ${chName} (${chId})\n`;
        });
      }
    }

    await message.reply(replyText);
  }
};
