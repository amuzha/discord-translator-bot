import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { config } from '../utils/config.js';
import { safeReply } from '../utils/helper.js';

export const name = 'giverole';
export const description = 'Give a role to a user';
export const aliases = [];

export const data = new SlashCommandBuilder()
  .setName('giverole')
  .setDescription('Give a role to a user')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to give role')
      .setRequired(true)
  )
  .addRoleOption(option =>
    option.setName('role')
      .setDescription('Role to assign')
      .setRequired(true)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '❌ You dont have permission.')
      : context.channel.send('❌ You dont have permission.');
  }

  let targetMember, role;

  if (context.isChatInputCommand?.()) {
    targetMember = context.options.getMember('user');
    role = context.options.getRole('role');
  } else {
    targetMember = context.mentions.members.first();
    if (!targetMember) {
      return context.channel.send(`⚠️ Please mention a user.\nUsage: ${config.prefix}giverole <@user> <role>`);
    }

    role = context.mentions.roles.first() || context.guild.roles.cache.find(r => r.name === args.slice(1).join(' '));
    if (!role) return context.channel.send('⚠️ Role not found.');
  }

  try {
    await targetMember.roles.add(role);
    const replyMsg = `✅ Role ${role.name} is assigned to ${targetMember.user.tag}`;
    if (context.isChatInputCommand?.()) {
      await safeReply(context, replyMsg, false);
    } else {
      await context.channel.send(replyMsg);
    }
  } catch (err) {
    console.error(err);
    if (context.isChatInputCommand?.()) {
      await safeReply(context, '❌ Failed to add role.');
    } else {
      await context.channel.send('❌ Failed to add role.');
    }
  }
}
