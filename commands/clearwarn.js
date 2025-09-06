import { config } from '../utils/config.js';
import { parseUserId, safeReply } from '../utils/helper.js';
import { removeWarnings } from '../utils/database.js';
import { SlashCommandBuilder } from 'discord.js';

export const name = 'clearwarn';
export const aliases = ['delwarn'];
export const description = 'Remove warnings from a user';

export const data = new SlashCommandBuilder()
  .setName('clearwarn')
  .setDescription('Remove warnings from a user')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to remove warnings from')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName('index')
      .setDescription('Warning index to remove (optional)')
      .setRequired(false)
  );

export async function execute(context, args, client) {
  const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
  if (!member?.permissions.has('KickMembers')) {
    const msg = '❌ You do not have permission to clear warnings.';
    return context.isChatInputCommand?.() ? await safeReply(context, msg) : context.channel.send(msg);
  }

  let userId, index;

  if (context.isChatInputCommand?.()) {
    const targetMember = context.options.getUser('user');
    userId = targetMember.id;
    index = context.options.getInteger('index') !== null ? context.options.getInteger('index') - 1 : null;
  } else {
    if (args.length < 1) {
      return context.channel.send(`⚠️ Usage: ${config.prefix}clearwarn <@user|id> [index]`);
    }
    userId = context.mentions.users.size ? context.mentions.users.first().id : parseUserId(args[0]);
    index = args[1] ? parseInt(args[1], 10) - 1 : null;
  }

  const success = removeWarnings(context.guild.id, userId, index);
  if (!success) {
    const msg = '❌ No warnings found to remove.';
    return context.isChatInputCommand?.() ? await safeReply(context, msg) : context.channel.send(msg);
  }

  const replyMsg = `✅ Warning${index !== null ? ` #${index + 1}` : 's'} removed for <@${userId}>.`;
  if (context.isChatInputCommand?.()) {
    await safeReply(context, replyMsg);
  } else {
    await context.channel.send(replyMsg);
  }
}
