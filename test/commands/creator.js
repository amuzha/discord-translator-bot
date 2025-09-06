export default {
  name: 'creator',
  description: 'Bot maker info',
  aliases: ['author', 'owner'],
  async execute(message) {
    await message.reply('👤 This bot is made by AMUZHA https://muzhaffar.my.id/ (TESTING)');
  }
};
