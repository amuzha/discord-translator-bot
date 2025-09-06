import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { config } from '../utils/config.js';
import { parseChannelId, safeReply } from '../utils/helper.js';
import { translate } from '../utils/translate.js';

export const name = 'sendto';
export const aliases = ['st'];
export const description = 'Send a translated message to a specific channel';

export const data = new SlashCommandBuilder()
  .setName('sendto')
  .setDescription('Send a translated message to a specific channel')
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Target channel')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('lang')
      .setDescription('Language code')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('text')
      .setDescription('Text to translate and send')
      .setRequired(true)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '❌ You dont have permission.')
      : context.channel.send('❌ You dont have permission.');
  }

  let channelId, lang, text;

  if (context.isChatInputCommand?.()) {
    if (!context.deferred && !context.replied) {
      await context.deferReply();
    }

    channelId = context.options.getChannel('channel')?.id;
    lang = context.options.getString('lang')?.toLowerCase();
    text = context.options.getString('text');
  } else {
    if (args.length < 3) {
      return context.channel.send(`⚠️ Use: \`${config.prefix}sendto <#channel|id> <lang> <text>\``);
    }
    channelId = parseChannelId(args.shift()) || args.shift();
    lang = args.shift().toLowerCase();
    text = args.join(' ');
  }

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '❌ Channel not found.')
      : context.channel.send('❌ Channel not found.');
  }

  const translated = await translate(text, lang);
  const embed = new EmbedBuilder()
    .setColor('#00BFFF')
    .setTitle(`📢 Announcement (${lang})`)
    .setDescription(translated)
    .setFooter({ text: `Posted by ${context.user?.tag || context.author?.tag}` })
    .setTimestamp();

  await channel.send({ embeds: [embed] });

  const finishMsg = `✅ Message sent to <#${channelId}> in language ${lang}.`;
  if (context.isChatInputCommand?.()) {
    await safeReply(context, finishMsg);
  } else {
    await context.channel.send(finishMsg);
  }
}
