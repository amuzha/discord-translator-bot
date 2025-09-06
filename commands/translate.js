import { config } from '../utils/config.js';
import { SlashCommandBuilder } from 'discord.js';
import { translate } from '../utils/translate.js';
import { safeReply } from '../utils/helper.js';

export const name = 'translate';
export const aliases = ['ta','tr'];
export const description = 'Translate text into a specific language';

export const data = new SlashCommandBuilder()
  .setName('translate')
  .setDescription('Translate text into a specific language')
  .addStringOption(option =>
    option.setName('lang')
      .setDescription('Target language (example: en, id, ja, etc)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('text')
      .setDescription('Text to translate')
      .setRequired(true)
  );

export async function execute(context, args) {
  let lang, text;

  if (context.isChatInputCommand?.()) {
    lang = context.options.getString('lang')?.toLowerCase();
    text = context.options.getString('text');
    if (!context.deferred && !context.replied) {
      await context.deferReply();
    }
  } else {
    if (args.length < 2) {
      return context.reply
        ? context.reply(`⚠️ Use: ${config.prefix}translate <lang> <text>`)
        : context.channel.send(`⚠️ Use: ${config.prefix}translate <lang> <text>`);
    }
    lang = args.shift().toLowerCase();
    text = args.join(' ');
  }

  try {
    const out = await translate(text, lang);
    if (context.isChatInputCommand?.()) {
      await safeReply(context, `📝 **Translated (${lang}):**\n${out}`, false);
    } else {
      return context.reply
        ? context.reply(`📝 **Translated (${lang}):**\n${out}`)
        : context.channel.send(`📝 **Translated (${lang}):**\n${out}`, false);
    }
  } catch (err) {
    console.error('Translate command error:', err);
    if (context.isChatInputCommand?.()) {
      await safeReply(context, '❌ An error occurred while translating.');
    } else {
      return context.reply
        ? context.reply('❌ An error occurred while translating.')
        : context.channel.send('❌ An error occurred while translating.');
    }
  }
}
