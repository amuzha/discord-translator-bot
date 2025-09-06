export default {
  name: 'ping',
  description: 'Check bot response (testing)',
  aliases: ['p'],
  async execute(message, args, client, commands, db = null) {
    const userCount = db?.users.length || 0;
    await message.reply(`Pong! Users in mock DB: ${userCount}`);
  }
};
