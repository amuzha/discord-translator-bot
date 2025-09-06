import fs from 'fs';
import path from 'path';

const dbFile = path.join(process.cwd(), 'database.json');
let guilds = {};

export function loadDB() {
  try {
    if (!fs.existsSync(dbFile)) {
      fs.writeFileSync(dbFile, JSON.stringify({}, null, 2));
      console.log(`⚠️ database.json not found, create new file in ${dbFile}`);
    }
    guilds = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  } catch (err) {
    console.error('❌ Failed to read or create database.json:', err);
    guilds = {};
  }
}

export function saveDB() {
  fs.writeFileSync(dbFile, JSON.stringify(guilds, null, 2));
}

export function setGuildLangMeta(guildId, lang, meta) {
  if (!guilds[guildId]) guilds[guildId] = { languages: {} };
  guilds[guildId].languages = guilds[guildId].languages || {};
  
  guilds[guildId].languages[lang] = { 
    channels: [],
    flag: meta.flag || '🏳️',
    title: meta.title || lang
  };

  saveDB();
}

export function getGuildConfig(guildId) {
  if (!guilds[guildId]) guilds[guildId] = { languages: {} };
  return guilds[guildId];
}

export function addGuildLangChannel(guildId, lang, channelId) {
  const g = getGuildConfig(guildId);
  g.languages[lang] = g.languages[lang] || { flag: '🏳️', title: lang, channels: [] };
  if (!g.languages[lang].channels.includes(channelId)) {
    g.languages[lang].channels.push(channelId);
    saveDB();
    return true;
  }
  return false;
}

export function removeGuildLangChannel(guildId, lang, channelId) {
  const g = getGuildConfig(guildId);
  if (!g.languages[lang]) return false;
  const before = g.languages[lang].channels.length;
  g.languages[lang].channels = g.languages[lang].channels.filter(id => id !== channelId);
  saveDB();
  return g.languages[lang].channels.length !== before;
}

// WARN SYSTEM
export function addWarning(guildId, userId, moderatorId, reason) {
  if (!guilds[guildId]) guilds[guildId] = {};
  guilds[guildId].warnings = guilds[guildId].warnings || {};
  guilds[guildId].warnings[userId] = guilds[guildId].warnings[userId] || [];

  guilds[guildId].warnings[userId].push({
    moderator: moderatorId,
    reason,
    timestamp: Date.now()
  });

  saveDB();
}

export function getWarnings(guildId, userId) {
  return guilds[guildId]?.warnings?.[userId] || [];
}

export function removeWarnings(guildId, userId, index = null) {
  if (!guilds[guildId]?.warnings?.[userId]) return false;

  if (index === null) {
    delete guilds[guildId].warnings[userId];
  } else {
    guilds[guildId].warnings[userId].splice(index, 1);
    if (guilds[guildId].warnings[userId].length === 0) {
      delete guilds[guildId].warnings[userId];
    }
  }

  saveDB();
  return true;
}
