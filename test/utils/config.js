import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('./test/.env') });

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  prefix: process.env.PREFIX || 'tm!',
  apiKey: {
    mymemory: { active: process.env.MYMEMORY_ACTIVE === 'true' }
  }
};

export function loadConfig() {
  if (!config.token) throw new Error('DISCORD_TOKEN is not set in .env (testing)');
  if (!config.clientId) throw new Error('CLIENT_ID is not set in .env (testing)');
}
