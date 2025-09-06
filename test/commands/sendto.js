import { translateWithMyMemory } from '../../utils/mymemory.js';

export default {
  name: 'sendto',
  description: 'Send a message to a channel with translate (testing)',
  aliases: ['st'],
  async execute(message, args, client, commands, db = null, cfg = null) {
    if (args.length < 3) return await message.reply(
      '❌ Format: sendto <channelID> <lang_code> <text>'
    );

    const targetId = args.shift();
    const langCode = args.shift();
    const text = args.join(' ');

    try {
      const translated = await translateWithMyMemory(
        text,
        langCode,
        cfg?.apiKey?.mymemory?.active ? '' : ''
      );

      target = client.channels.cache.get(targetId);
      if (target && target.isTextBased()) {
        await target.send(`[TEST SENDTO] ${translated}`);
        await message.reply(`✅ Message sent to channel ${target.name}`);
        if (db) db.sent = db.sent || [];
        db.sent.push({ type: 'channel', id: target.id, text: translated });
        return;
      }

      await message.reply('❌ ID not found as channel.');

    } catch (err) {
      console.error('❌ Error sendto+translate TEST:', err);
      await message.reply('❌ Failed to send message, check logs.');
    }
  }
};
