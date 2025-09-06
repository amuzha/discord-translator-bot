export default {
  name: 'help',
  description: 'List of testing commands',
  aliases: ['h'],
  async execute(message, args, client, commands) {
    const commandList = Array.from(commands.values())
      .map(cmd => `\`${cmd.name}\` - ${cmd.description}`)
      .join('\n');
    await message.reply(`{📜}=> Command TEST <={📜}\n${commandList}`);
  }
};
