import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { safeReply } from '../utils/helper.js';
import { config } from '../utils/config.js';

export const name = 'ban';
export const description = 'Ban a user from the guild';
export const aliases = [];

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user from the guild')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to ban')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for banning')
      .setRequired(false)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    const msg = '❌ You dont have permission.';
    return context.isChatInputCommand?.() ? await safeReply(context, msg) : context.channel.send(msg);
  }

  let targetMember, reason;

  if (context.isChatInputCommand?.()) {
    targetMember = context.options.getMember('user');
    reason = context.options.getString('reason') || 'No reason provided';
  } else {
    targetMember = context.mentions?.members?.first();
    if (!targetMember) {
      return context.channel.send(`⚠️ Use: ${config.prefix}ban <@user> [reason]`);
    }
    reason = args.slice(1).join(' ') || 'No reason provided';
  }

  const botMember = await context.guild.members.fetchMe();

  if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
    const msg = '❌ Cannot ban members with a higher role than bots.';
    return context.isChatInputCommand?.() ? await safeReply(context, msg) : context.channel.send(msg);
  }

  if (targetMember.id === context.guild.ownerId) {
    const msg = '❌ Cannot ban server owner.';
    return context.isChatInputCommand?.() ? await safeReply(context, msg) : context.channel.send(msg);
  }

  try {
    await targetMember.ban({ reason });
    const replyMsg = `✅ User ${targetMember.user.tag} has been banned.\nReason: ${reason}`;
    if (context.isChatInputCommand?.()) {
      await safeReply(context, replyMsg);
    } else {
      await context.channel.send(replyMsg);
    }
  } catch (err) {
    console.error(err);
    const errMsg = '❌ Failed to ban user.';
    if (context.isChatInputCommand?.()) {
      await safeReply(context, errMsg);
    } else {
      await context.channel.send(errMsg);
    }
  }
}
