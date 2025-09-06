import { PermissionsBitField, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { removeGuildLangChannel, getGuildConfig } from '../utils/database.js';
import { parseChannelId, safeReply } from '../utils/helper.js';
import { config } from '../utils/config.js';

export const name = 'removechannel';
export const aliases = ['rc'];
export const description = 'Remove a channel from a specific language';

export const data = new SlashCommandBuilder()
  .setName('removechannel')
  .setDescription('Remove a channel from a specific language')
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Channel to remove')
      .setRequired(true)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '❌ You dont have permission.')
      : context.reply
        ? context.reply('❌ You dont have permission.')
        : context.channel.send('❌ You dont have permission.');
  }

  let channelId;

  if (context.isChatInputCommand?.()) {
    channelId = context.options.getChannel('channel')?.id;
    const guildCfg = getGuildConfig(context.guild.id);

    const langOptions = Object.entries(guildCfg.languages || {})
      .filter(([lang, meta]) => (meta.channels || []).includes(channelId))
      .map(([lang, meta]) => ({
        label: meta.title || lang,
        value: lang
      }));

    if (!langOptions.length) {
      return await safeReply(context, '⚠️ This channel is not yet listed in any language.');
    }

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`removechannel-${channelId}-${context.user.id}`)
        .setPlaceholder('Select language')
        .addOptions(langOptions)
    );

    const msg = await safeReply(context, { content: 'Select the language you want to delete:', components: [row] });

    try {
      const selectInteraction = await msg.awaitMessageComponent({
        filter: i => i.user.id === context.user.id && i.customId.startsWith(`removechannel-${channelId}-${context.user.id}`),
        componentType: ComponentType.StringSelect,
        time: 20_000
      });

      const lang = selectInteraction.values[0];
      const removed = removeGuildLangChannel(context.guild.id, lang, channelId);

      await selectInteraction.update({
        content: removed
          ? `✅ Channel <#${channelId}> removed from language **${lang}**.`
          : '⚠️ Language/Channel not found.',
        components: []
      });
    } catch (err) {
      await msg.edit({ content: '⏰ Time out. Language selection canceled.', components: [] });
    }

  } else {
    if (!args[0] || !args[1]) {
      return context.channel.send(`⚠️ Use: \`${config.prefix}removechannel <lang> <#channel>\``);
    }

    const lang = args[0].toLowerCase();
    channelId = parseChannelId(args[1]) || args[1];
    const removed = removeGuildLangChannel(context.guild.id, lang, channelId);

    return context.channel.send(
      removed
        ? `✅ Channel <#${channelId}> removed from language **${lang}**.`
        : '⚠️ Language/Channel not found.'
    );
  }
}
