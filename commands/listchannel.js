import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getGuildConfig } from '../utils/database.js';

export const name = 'listchannel';
export const aliases = ['lc'];
export const description = 'List all channels for each language';

export const data = new SlashCommandBuilder()
  .setName('listchannel')
  .setDescription('List all channels for each language');

export async function execute(context, args) {
  const guildId = context.guild?.id;
  if (!guildId) return;

  const guildCfg = getGuildConfig(guildId);
  const languages = guildCfg.languages || {};

  const lines = Object.entries(languages).map(([lang, meta]) => {
    const chs = (meta.channels || []).map(id => `<#${id}>`).join(', ') || '-';
    return `**${lang}** (${meta.flag || '🏳️'} | ${meta.title || lang}): ${chs}`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`📋 Channels (${context.guild.name})`)
    .setDescription(lines.length ? lines.join('\n') : '_There are no channels yet_')
    .setColor('#00BFFF');

  if (context.reply) {
    return context.reply({ embeds: [embed] });
  } else {
    return context.channel.send({ embeds: [embed] });
  }
}
