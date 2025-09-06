export function parseChannelId(mentionOrId) {
  if (!mentionOrId) return null;
  const m = mentionOrId.match(/^<#!?(\d+)>$/) || mentionOrId.match(/^#?(\d+)$/);
  return m ? m[1] : mentionOrId;
}

export function parseUserId(mentionOrId) {
    if (!mentionOrId) return null;
    const match = mentionOrId.match(/^<@!?(\d+)>$/);
    return match ? match[1] : mentionOrId;
}

export async function safeReply(interaction, content, ephemeral = true) {
  try {
    const payload = typeof content === 'string' ? { content, ephemeral } : content;
    if (interaction.deferred || interaction.replied) {
      return await interaction.followUp(payload);
    } else {
      return await interaction.reply(payload);
    }
  } catch (err) {
    console.error('❌ SafeReply error:', err.message);
  }
}
