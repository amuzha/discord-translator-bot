import { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { config } from '../utils/config.js';
import { getWarnings } from '../utils/database.js';
import { safeReply } from '../utils/helper.js';

export const name = 'warnlist';
export const description = 'Check user warnings';
export const aliases = ['warnlist'];

export const data = new SlashCommandBuilder()
  .setName('warnlist')
  .setDescription('Check user warnings')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to check')
      .setRequired(true)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '❌ You dont have permission.')
      : context.channel.send('❌ You dont have permission.');
  }

  let user;

  if (context.isChatInputCommand?.()) {
    user = context.options.getUser('user');
  } else {
    user = context.mentions?.users?.first();
    if (!user) {
      return context.channel.send(`⚠️ Please mention user.\nUsage: ${config.prefix}warnlist <@user>`);
    }
  }

  const warnlist = getWarnings(context.guild.id, user.id);

  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle(`Warn List of ${user.tag}`)
    .setDescription(
      warnlist.length
        ? warnlist.map((w, i) => `${i + 1}. ${w.reason} (by <@${w.moderator}>)`).join('\n')
        : 'No warnlist'
    )
    .setTimestamp();

  if (context.isChatInputCommand?.()) {
    await safeReply(context, { embeds: [embed] });
  } else {
    await context.channel.send({ embeds: [embed] });
  }
}
