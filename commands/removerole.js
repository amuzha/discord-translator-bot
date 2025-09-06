import { PermissionsBitField, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { safeReply } from '../utils/helper.js';
import { config } from '../utils/config.js';

export const name = 'removerole';
export const description = 'Remove a role from a user';
export const aliases = [];

export const data = new SlashCommandBuilder()
  .setName('removerole')
  .setDescription('Remove a role from a user')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to remove role from')
      .setRequired(true)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '❌ You dont have permission.')
      : context.channel.send('❌ You dont have permission.');
  }

  let targetMember;
  if (context.isChatInputCommand?.()) {
    targetMember = context.options.getMember('user');
  } else {
    targetMember = context.mentions.members.first();
    if (!targetMember) {
      return context.channel.send(`⚠️ Please mention a user.\nUsage: ${config.prefix}removerole <@user>`);
    }
  }

  const removableRoles = targetMember.roles.cache
    .filter(r => r.id !== context.guild.id)
    .map(r => ({ label: r.name, value: r.id }));

  if (!removableRoles.length) {
    return context.isChatInputCommand?.()
      ? await safeReply(context, '⚠️ This user does not have any role.')
      : context.channel.send('⚠️ This user does not have any role.');
  }

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`removerole-${targetMember.id}-${context.user.id}`)
      .setPlaceholder('Select the role to delete')
      .addOptions(removableRoles.slice(0, 25))
  );

  const replyMsg = context.isChatInputCommand?.()
    ? await safeReply(context, { content: 'Select the role to delete:', components: [row] })
    : await context.channel.send({ content: 'Select the role to delete:', components: [row] });

  try {
    const selectInteraction = await replyMsg.awaitMessageComponent({
      filter: i => i.user.id === context.user.id && i.customId.startsWith(`removerole-${targetMember.id}-`),
      componentType: ComponentType.StringSelect,
      time: 20000
    });

    const roleId = selectInteraction.values[0];
    const role = context.guild.roles.cache.get(roleId);
    await targetMember.roles.remove(role);

    await selectInteraction.update({ content: `✅ Role **${role.name}** removed from ${targetMember.user.tag}`, components: [] });
  } catch {
    await replyMsg.edit({ content: '⏰ Time out, action cancelled.', components: [] });
  }
}
