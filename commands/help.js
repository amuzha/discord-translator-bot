import { config } from '../utils/config.js';
import { SlashCommandBuilder } from 'discord.js';

export const name = 'help';
export const description = 'Show help menu';
export const aliases = ['menu'];

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show help menu');

export async function execute(context, args, client, commands) {
  if (!commands) return;

  const embedDescription = Array.from(commands.values())
      .map(cmd => `**${config.prefix}${cmd.name}** - ${cmd.description || 'No description'}`)
      .join('\n');

  const replyContent = `📖 **Help Menu**\nPrefix: \`${config.prefix}\`\n\n${embedDescription}`;

  if (context.reply) {
    await context.reply(replyContent);
  } else {
    await context.channel.send(replyContent);
  }
}
