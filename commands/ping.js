import { SlashCommandBuilder } from 'discord.js';
import { safeReply } from '../utils/helper.js';

export const name = 'ping';
export const description = 'Check bot latency';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check bot latency');

export async function execute(context, args, client) {
  if (context.isChatInputCommand?.()) {
    const m = await safeReply(context, '🏓 Pinging...');
    const latency = Date.now() - context.createdTimestamp;
    await safeReply(context, `🏓 Pong! Latency: ${latency}ms`, false);
    return;
  }

  const m = await context.reply('🏓 Pinging...');
  const latency = m.createdTimestamp - context.createdTimestamp;
  await m.edit(`🏓 Pong! Latency: ${latency}ms`);
}
