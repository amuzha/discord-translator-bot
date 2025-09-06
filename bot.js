import {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField
} from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const CONFIG_FILE = './config.json';
const PREFIX = process.env.COMMAND_PREFIX || '!';
const ENV_OWNERS = process.env.OWNERS ? process.env.OWNERS.split(',').map(s => s.trim()).filter(Boolean) : [];
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let config = {};
function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (e) {
            console.error('Gagal baca config.json — pakai default. Error:', e);
            config = {};
        }
    } else {
        config = {};
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    }

    config.owners = Array.isArray(config.owners)
        ? config.owners.concat(ENV_OWNERS).filter((v, i, a) => v && a.indexOf(v) === i)
        : ENV_OWNERS;
    config.guilds = config.guilds || {};
}
loadConfig();

fs.watch(CONFIG_FILE, () => {
    console.log('🔄 config.json changed — reloading config in memory');
    loadConfig();
});

let OWNERS = config.owners;

function saveConfig() {
    config.owners = Array.isArray(OWNERS) ? OWNERS : [];
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (e) {
        console.error('Gagal simpan config.json:', e);
    }
}

function getGuildConfig(guildId) {
    config.guilds[guildId] = config.guilds[guildId] || { languages: {} };
    return config.guilds[guildId];
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
});

// Function
async function translateGemini(text, targetLang) {
    try {
        const prompt = `Detect the language of the following text and translate it to ${targetLang}.
Return JSON only:
{"source_lang":"<code>","translation":"<translated text>"}

Text:
${text}`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Ambil JSON
        const match = responseText.match(/\{.*\}/);
        if (!match) return text;

        const data = JSON.parse(match[0]);
        if (data.translation) return data.translation;
        return text;
    } catch (err) {
        console.error("Gemini translate error:", err);
        return text;
    }
}

async function translateMyMemory(text, targetLang) {
    try {
        const detectUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|id`;
        const detectResp = await fetch(detectUrl);
        const detectData = await detectResp.json();
        const detectedSource =
            detectData.matches && detectData.matches[0] && detectData.matches[0].source
                ? detectData.matches[0].source
                : null;
        const detectedLang = detectedSource ? detectedSource.slice(0, 2).toLowerCase() : 'id';

        if (detectedLang === targetLang) return text;

        const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${detectedLang}|${targetLang}`;
        const resp = await fetch(translateUrl);
        const data = await resp.json();
        if (data && data.responseData && typeof data.responseData.translatedText === 'string') {
            return data.responseData.translatedText;
        }
        return text;
    } catch (err) {
        console.error('Translate Error:', err);
        return text;
    }
}

async function translate(text, targetLang) {
    const geminiResult = await translateGemini(text, targetLang);
    if (geminiResult && geminiResult !== text) return geminiResult;
    return await translateMyMemory(text, targetLang);
}

function parseChannelId(mention) {
    if (!mention) return null;
    const m = mention.match(/^<#!?(\d+)>$/) || mention.match(/^#?(\d+)$/);
    return m ? m[1] : null;
}

client.on('messageCreate', async (message) => {
    try {
        if (message.author?.bot) return;

        OWNERS = Array.isArray(config.owners) ? config.owners : OWNERS;

        if (!message.content.startsWith(PREFIX)) return;

        const raw = message.content.slice(PREFIX.length).trim();
        if (!raw) return;
        const parts = raw.split(/ +/);
        const command = parts.shift().toLowerCase();
        const args = parts;

        let member = message.member;
        if (message.guild && !member) {
            try {
                member = await message.guild.members.fetch(message.author.id);
            } catch {
                member = null;
            }
        }

        // OWNER: addowner
        if (command === 'addowner') {
            if (!OWNERS.includes(message.author.id)) {
                await message.reply('❌ Kamu bukan owner.');
                return;
            }
            if (args.length < 1) {
                await message.reply(`⚠️ Gunakan: \`${PREFIX}addowner <discord_id>\``);
                return;
            }

            try {
                const newOwner = args[0].trim();
                console.log(`✅ Menambahkan owner: ${newOwner}`);
                if (OWNERS.includes(newOwner)) {
                    await message.reply('⚠️ ID ini sudah menjadi owner.');
                    return;
                }
                OWNERS.push(newOwner);
                config.owners = OWNERS;
                saveConfig();
                console.log('✅ saveConfig selesai');
                await message.reply(`✅ ID **${newOwner}** berhasil ditambahkan sebagai owner.`);
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
            return;
        }

        // OWNER: setprefix (prefix tetap dari ENV → hanya info)
        if (command === 'setprefix') {
            if (!OWNERS.includes(message.author.id))
                return message.reply('❌ Kamu bukan owner, tidak bisa mengganti prefix.');

            if (args.length < 1) return message.reply(`⚠️ Gunakan: \`${PREFIX}setprefix <prefix_baru>\``);

            PREFIX = args[0];
            config.prefix = PREFIX;
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
            return message.reply(`✅ Prefix berhasil diubah menjadi \`${PREFIX}\``);
        }

        // SERVER ADMIN: addlang
        if (command === 'addlang') {
            if (!message.member?.permissions?.has(PermissionsBitField.Flags.Administrator))
                return message.reply('❌ Kamu tidak punya izin.');
            if (args.length < 3)
                return message.reply(`⚠️ Gunakan: \`${PREFIX}addlang <lang_code> <emoji_flag> <judul>\``);

            try {
                const lang = args.shift().toLowerCase();
                const flag = args.shift();
                const title = args.join(' ');

                const guildCfg = getGuildConfig(message.guild.id);
                guildCfg.languages[lang] = guildCfg.languages[lang] || { channels: [], flag: flag, title: title };
                guildCfg.languages[lang].flag = flag;
                guildCfg.languages[lang].title = title;
                saveConfig();

                return message.reply(`✅ Bahasa **${lang}** ditambahkan/diupdate dengan flag ${flag} dan judul "${title}".`);
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // setchannel
        if (command === 'setchannel') {
            if (!message.member?.permissions?.has(PermissionsBitField.Flags.Administrator))
                return message.reply('❌ Kamu tidak punya izin.');
            if (args.length < 2)
                return message.reply(`⚠️ Gunakan: \`${PREFIX}setchannel <lang> <#channel>\``);

            try {
                const lang = args[0].toLowerCase();
                const channelId = parseChannelId(args[1]) || args[1];

                const guildCfg = getGuildConfig(message.guild.id);
                guildCfg.languages[lang] = guildCfg.languages[lang] || { channels: [], flag: '🏳️', title: lang };


                if (!guildCfg.languages[lang].channels.includes(channelId)) {
                    guildCfg.languages[lang].channels.push(channelId);
                    saveConfig();
                    return message.reply(`✅ Channel <#${channelId}> ditambahkan untuk bahasa **${lang}**.`);
                } else {
                    return message.reply('⚠️ Channel sudah ada.');
                }
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // removechannel
        if (command === 'removechannel') {
            if (!message.member?.permissions?.has(PermissionsBitField.Flags.Administrator))
                return message.reply('❌ Kamu tidak punya izin.');
            if (args.length < 2)
                return message.reply(`⚠️ Gunakan: \`${PREFIX}removechannel <lang> <#channel>\``);

            try {
                const lang = args[0].toLowerCase();
                const channelId = parseChannelId(args[1]) || args[1];

                const guildCfg = getGuildConfig(message.guild.id);
                if (!guildCfg.languages[lang]) return message.reply('⚠️ Bahasa tidak ditemukan.');
                guildCfg.languages[lang].channels = guildCfg.languages[lang].channels.filter(id => id !== channelId);
                saveConfig();

                return message.reply(`✅ Channel <#${channelId}> dihapus dari bahasa **${lang}**.`);
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // listchannels
        if (command === 'listchannels') {
            const guildCfg = getGuildConfig(message.guild.id);
            const languages = guildCfg.languages || {};

            try {
                const lines = Object.entries(languages).map(([lang, meta]) => {
                    const chs = (meta.channels || []).map(id => `<#${id}>`).join(', ') || '-';
                    return `**${lang}** (${meta.flag || '🏳️'} | ${meta.title || lang}): ${chs}`;
                });

                const embed = new EmbedBuilder()
                    .setTitle(`📋 Channel List (${message.guild.name})`)
                    .setDescription(lines.length ? lines.join('\n') : '_Belum ada channel_')
                    .setColor('#00BFFF');

                return message.reply({ embeds: [embed] });
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // announce
        if (['announce', 'broadcast', 'bc'].includes(command)) {
            if (!message.member?.permissions?.has(PermissionsBitField.Flags.Administrator))
                return message.reply('❌ Kamu tidak punya izin.');
            const text = args.join(' ');
            if (!text) return message.reply('⚠️ Harap tulis pesan!');

            await message.reply('🛠️ Mengirim pengumuman...');
            try {
                const guildCfg = getGuildConfig(message.guild.id);
                let sentCount = 0;

                for (const [lang, meta] of Object.entries(guildCfg.languages)) {
                    const translated = await translate(text, lang);
                    for (const chId of meta.channels) {
                        const channel = await client.channels.fetch(chId).catch(() => null);
                        if (!channel) continue;

                        const embed = new EmbedBuilder()
                            .setColor('#FFD700')
                            .setTitle(`${meta.flag || ''} ${meta.title || lang}`)
                            .setDescription(translated)
                            .setFooter({ text: `Dikirim oleh ${message.author.tag}` })
                            .setTimestamp();

                        await channel.send({ embeds: [embed] });
                        sentCount++;
                    }
                }

                return message.channel.send(`✅ Selesai! Terkirim ke ${sentCount} channel.`);
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // announce-test (hapus setelah 20 detik)
        if (['announce-test', 'tester'].includes(command)) {
            if (!message.member?.permissions?.has(PermissionsBitField.Flags.Administrator))
                return message.reply('❌ Kamu tidak punya izin.');
            const text = args.join(' ');
            if (!text) return message.reply('⚠️ Harap tulis pesan!');

            try {
                const guildCfg = getGuildConfig(message.guild.id);
                const sentMessages = [];

                for (const [lang, meta] of Object.entries(guildCfg.languages)) {
                    const translated = await translate(text, lang);
                    for (const chId of meta.channels) {
                        const channel = await client.channels.fetch(chId).catch(() => null);
                        if (!channel) continue;

                        const embed = new EmbedBuilder()
                            .setColor('#00BFFF')
                            .setTitle(`(TEST) ${meta.flag || ''} ${meta.title || lang}`)
                            .setDescription(translated)
                            .setFooter({ text: `Dikirim oleh ${message.author.tag}` })
                            .setTimestamp();

                        const msg = await channel.send({ embeds: [embed] });
                        sentMessages.push(msg);
                    }
                }


                const infoMsg = await message.reply(`✅ (TEST) Terkirim ke ${sentMessages.length} pesan. Akan dihapus 20 detik.`);
                setTimeout(async () => {
                    for (const m of sentMessages) await m.delete().catch(() => { });
                    await infoMsg.delete().catch(() => { });
                    await message.delete().catch(() => { });
                }, 20000);
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // sendto
        if (['sendto', 'st'].includes(command)) {
            if (!message.member?.permissions?.has(PermissionsBitField.Flags.Administrator))
                return message.reply('❌ Kamu tidak punya izin.');
            if (args.length < 3)
                return message.reply(`⚠️ Gunakan: \`${command} <#channel|id> <lang> <teks>\``);

            try {
                const lang = args.shift().toLowerCase();
                const channelId = parseChannelId(args.shift()) || args.shift();
                const text = args.join(' ');

                if (!/^[a-z]{2,5}$/.test(lang)) {
                    return message.reply(`❌ Kode bahasa **${lang}** tidak valid. Gunakan kode ISO (contoh: en, id, ja) atau 'auto' untuk random.`);
                }

                const channel = await client.channels.fetch(channelId).catch(() => null);
                if (!channel) return message.reply('❌ Channel tidak ditemukan.');

                const translated = await translate(text, lang);
                const embed = new EmbedBuilder()
                    .setColor('#00BFFF')
                    .setTitle(`📢 Announcement (${lang})`)
                    .setDescription(translated)
                    .setFooter({ text: `Dikirim oleh ${message.author.tag}` })
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
                return message.reply(`✅ Pesan terkirim ke <#${channelId}> dalam bahasa ${lang}.`);
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // translate
        if (['translate', 'tr', 'ta'].includes(command)) {
            if (args.length < 2)
                return message.reply(`⚠️ Gunakan: \`${PREFIX}translate <lang> <teks>\``);
            try {
                const lang = args.shift().toLowerCase();
                const text = args.join(' ');

                if (!/^[a-z]{2,5}$/.test(lang)) {
                    return message.reply(`❌ Kode bahasa **${lang}** tidak valid. Gunakan kode ISO (contoh: en, id, ja) atau 'auto' untuk random.`);
                }

                const translated = await translate(text, lang);
                return message.reply(`📝 **Terjemahan (${lang}):**\n${translated}`);
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // translate
        if (command === 'creator' || command === 'owner') {
            try {
                const embed = new EmbedBuilder()
                    .setTitle('Amuzha Bot')
                    .setColor('#00BFFF')
                    .setDescription('Klik tombol di bawah untuk mengunjungi situs pembuat.');

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('muzhaffar.my.id')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://muzhaffar.my.id/')
                );

                return message.reply({ embeds: [embed], components: [row] });
            } catch (err) {
                console.error(`${command} error:`, err);
                await message.reply('❌ Terjadi kesalahan.');
            }
        }

        // ping
        if (command === 'ping') {
            const m = await message.reply('🏓 Pinging...');
            const latency = m.createdTimestamp - message.createdTimestamp;
            return m.edit(`🏓 Pong! Latency: ${latency}ms`);
        }

        // help
        if (command === 'help') {
            const embed = new EmbedBuilder()
                .setTitle('📜 Daftar Perintah')
                .setColor('#00BFFF')
                .setDescription(`
**Prefix:** \`${PREFIX}\`

**ANNOUNCEMENT**
${PREFIX}announce <teks>
${PREFIX}announce-test <teks>
${PREFIX}sendto <lang> <#channel> <teks>

**LANG & CHANNEL**
${PREFIX}addlang <lang> <emoji_flag> <judul>
${PREFIX}setchannel <lang> <#channel>
${PREFIX}removechannel <lang> <#channel>
${PREFIX}listchannels

**TOOLS**
${PREFIX}translate <lang> <teks>
${PREFIX}ping

**OWNER**
${PREFIX}addowner <discord_id>
${PREFIX}setprefix (hanya info)
`);
            return message.reply({ embeds: [embed] });
        }
    } catch (err) {
        console.error('Error command:', err);
        try {
            await message.reply('❌ Terjadi kesalahan.');
        } catch { }
    }
});

client.login(process.env.DISCORD_TOKEN);
