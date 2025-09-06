import { PermissionsBitField, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { config } from '../utils/config.js';
import { addGuildLangChannel, getGuildConfig } from '../utils/database.js';
import { parseChannelId, safeReply } from '../utils/helper.js';

export const name = 'setchannel';
export const aliases = ['sc'];
export const description = 'Set a channel for a specific language';

export const data = new SlashCommandBuilder()
  .setName('setchannel')
  .setDescription('Set a channel for a specific language')
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Channel to set')
      .setRequired(true)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '❌ You don\'t have permission.')
      : context.channel.send('❌ You don\'t have permission.');
  }

  const channelId = context.isChatInputCommand?.()
    ? context.options.getChannel('channel')?.id
    : parseChannelId(args[1]) || args[1];

  if (context.isChatInputCommand?.()) {
    const guildCfg = getGuildConfig(context.guild.id);
    const existingLangs = Object.entries(guildCfg.languages || {})
      .map(([lang, meta]) => ({
        label: meta.title || lang,
        value: lang
      }));

    if (!existingLangs.length) {
      return await safeReply(context, '⚠️ No languages available.');
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`setchannel-${channelId}-${context.user.id}`)
          .setPlaceholder('Select language')
          .addOptions(existingLangs)
      );

    const msg = await safeReply(context, {
      content: 'Select a language to add a channel:',
      components: [row],
      ephemeral: false
    });

    try {
      const selectInteraction = await msg.awaitMessageComponent({
        filter: i => i.user.id === context.user.id && i.customId.startsWith(`setchannel-${channelId}-${context.user.id}`),
        componentType: ComponentType.StringSelect,
        time: 20_000
      });

      const lang = selectInteraction.values[0];
      const added = addGuildLangChannel(context.guild.id, lang, channelId);

      await selectInteraction.update({
        content: added
          ? `✅ Channel <#${channelId}> added for language **${lang}**.`
          : '⚠️ The channel already exists.',
        components: []
      });
    } catch (err) {
      try {
        await msg.edit({ content: '⏰ Time out. Language selection canceled.', components: [] });
      } catch {
        console.warn('Cannot edit message, it may be deleted.');
      }
    }
  } else {
    if (!args[0] || !args[1]) {
      return context.channel.send(`⚠️ Use: \`${config.prefix}setchannel <lang> <#channel>\``);
    }

    const lang = args[0].toLowerCase();
    const added = addGuildLangChannel(context.guild.id, lang, channelId);
    return context.channel.send(added
      ? `✅ Channel <#${channelId}> added for language **${lang}**.`
      : '⚠️ The channel already exists.'
    );
  }
}
