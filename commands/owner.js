import { config } from '../utils/config.js';
import { SlashCommandBuilder } from 'discord.js';
import { safeReply } from '../utils/helper.js';

export const name = 'owner';
export const aliases = ['creator'];
export const description = 'Show bot owners/creators';

export const data = new SlashCommandBuilder()
  .setName('owner')
  .setDescription('Show bot owners/creators');

export async function execute(context, args) {
  const ownersList = config.owners.length
    ? config.owners.map(id => `<@${id}>`).join(', ')
    : null;

  const replyMessage = ownersList
    ? `👑 Bot Owner(s): ${ownersList}`
    : 'No owners found.';

  if (context.isChatInputCommand?.()) {
    await safeReply(context, replyMessage, false);
  }

  await context.reply ? context.reply(replyMessage) : context.channel.send(replyMessage);
}
