import { translateWithMyMemory } from '../../utils/mymemory.js';

export default {
    name: 'translate',
    description: 'Translate text using MyMemory API (testing)',
    aliases: ['tr'],
    async execute(message, args, client, commands, db = null, cfg = null) {
        if (args.length < 2) return await message.reply(
            '❌ Format: translate <lang_code> <text>'
        );

        const langCode = args.shift();
        const text = args.join(' ');

        try {
            const translated = await translateWithMyMemory(
                text,
                langCode,
                cfg?.apiKey?.mymemory?.active ? '' : ''
            );

            await message.reply(`🌐 [TEST TRANSLATE] ${translated}`);

            if (db) {
                db.translations = db.translations || [];
                db.translations.push({ text, translated, user: message.author.id, lang: langCode });
            }

        } catch (err) {
            console.error('❌ Error translate TEST:', err);
            await message.reply('❌ An error occurred while translating (TEST).');
        }
    }
};
