import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { setGuildLangMeta, getGuildConfig } from '../utils/database.js';
import { config } from '../utils/config.js';

export const name = 'setlang';
export const aliases = ['addlang'];
export const description = 'Add a new language with emoji flag and title';

export const data = new SlashCommandBuilder()
  .setName('setlang')
  .setDescription('Add a new language with emoji flag and title')
  .addStringOption(option =>
    option.setName('lang')
      .setDescription('Language code, example: en, id, jp, ru, etc.')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('flag')
      .setDescription('Flag emoji, example: 🇮🇩.')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('title')
      .setDescription('Language title, example: Indonesia')
      .setRequired(true)
  );

export async function execute(context, args) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const reply = '❌ You dont have permission.';
    if (context.reply) return context.reply({ content: reply, ephemeral: true });
    return context.channel.send(reply);
  }

  let lang, flag, title;

  if (context.isChatInputCommand?.()) {
    lang = context.options.getString('lang')?.toLowerCase();
    flag = context.options.getString('flag');
    title = context.options.getString('title');
  } else {
    if (args.length < 3)
      return context.channel.send(`⚠️ Use: \`${config.prefix}setlang <lang> <flag_emoji> <title>\``);

    lang = args.shift().toLowerCase();
    flag = args.shift();
    title = args.join(' ');
  }

  setGuildLangMeta(context.guild.id, lang, { flag, title });

  const replyMsg = `✅ **${lang}** Language set: ${flag} — "${title}".`;
  if (context.isChatInputCommand?.()) return context.reply({ content: replyMsg, ephemeral: true });
  return context.channel.send(replyMsg);
}
