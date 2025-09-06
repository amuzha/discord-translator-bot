export default {
  name: 'setlang',
  description: 'Set language for guild (testing)',
  aliases: ['sl'],
  async execute(message, args, client, commands, db = null) {
    if (!db) return await message.reply('❌ Mock DB is not available.');
    if (!message.guild) return await message.reply('❌ This command can only be run on the server (guild).');
    if (!args.length) return await message.reply('❌ Format: setlang <lang_code>');

    const lang = args[0];
    const guildId = message.guild.id;

    let guild = db.guilds.find(g => g.id === guildId);
    if (!guild) {
      guild = { id: guildId, languages: {} };
      db.guilds.push(guild);
    }

    if (!guild.languages) guild.languages = {};

    if (!guild.languages[lang]) {
      guild.languages[lang] = { channels: [], title: lang };
    } else {
      guild.languages[lang].title = lang;
      if (!guild.languages[lang].channels) guild.languages[lang].channels = [];
    }

    await message.reply(`✅ The language for this guild is set to: ${lang}`);
  }
};
