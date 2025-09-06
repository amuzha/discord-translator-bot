import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

export let config = {
  prefix: 'm!',
  token: '',
  clientId: '',
  premiumApiKey: '',
  guildIds: [],
  owners: [],
  apiKey: {
    gemini: [
      { active: true, key: '' },
      { active: false, key: '' },
      { active: false, key: '' }
    ],
    google: { active: false },
    mymemory: { active: true }
  }
};

export function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
      console.log(`⚠️ config.json not found, create new file in ${CONFIG_PATH}`);
    }

    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);

    config = Object.assign({}, config, parsed || {});
  } catch (e) {
    console.error('Failed to read config.json:', e);
  }
}

export function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log('✅ saveConfig completed');
  } catch (e) {
    console.error('Failed to save config.json:', e);
  }
}

export function isOwner(userId) {
  return Array.isArray(config.owners) && config.owners.includes(userId);
}
