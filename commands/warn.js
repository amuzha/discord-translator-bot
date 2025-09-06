import { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { addWarning, getWarnings } from '../utils/database.js';
import { safeReply } from '../utils/helper.js';
import { config } from '../utils/config.js';

export const name = 'warn';
export const description = 'Warn a user in the guild';
export const aliases = ['warning'];

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a user in the guild')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to warn')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for warning')
      .setRequired(false)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '❌ You do not have permission to give warnings.')
      : context.channel.send('❌ You do not have permission to give warnings.');
  }

  let user, reason;

  if (context.isChatInputCommand?.()) {
    user = context.options.getUser('user');
    reason = context.options.getString('reason') || 'No reason provided';
  } else {
    user = context.mentions?.users?.first();
    if (!user) {
      return context.channel.send(`⚠️ Please mention the user you wish to warn.\nUsage: ${config.prefix}warn <@user> [reason]`);
    }
    reason = args.slice(1).join(' ') || 'No reason provided';
  }

  addWarning(context.guild.id, user.id, context.user?.id || context.author.id, reason);

  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('⚠️ User Warned')
    .setDescription(`User ${user} has been warned.\nReason: ${reason}`)
    .setFooter({ text: `Warned by ${context.user?.tag || context.author.tag}` })
    .setTimestamp();

  if (context.isChatInputCommand?.()) {
    await safeReply(context, { embeds: [embed] });
  } else {
    await context.channel.send({ embeds: [embed] });
  }
}
