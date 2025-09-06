import { config } from './config.js';
import { translateWithGemini } from './gemini.js';
import { translateWithGoogle } from './google.js';
import { translateWithMyMemory } from './mymemory.js';

let geminiIndex = 0;
const geminiErrorLogged = new Map();

export async function translate(text, targetLang) {
  const lang = (targetLang || '').trim().toLowerCase();
  const finalLang = /^[a-z]{2,5}$/.test(lang) ? lang : 'en';
  let result = null;

  // --- GEMINI ROTATION ---
  if (Array.isArray(config.apiKey.gemini)) {
    const totalKeys = config.apiKey.gemini.length;

    for (let i = 0; i < totalKeys; i++) {
      const currentIndex = (geminiIndex + i) % totalKeys;
      const geminiCfg = config.apiKey.gemini[currentIndex];

      if (!geminiCfg?.active) continue;

      try {
        result = await translateWithGemini(text, finalLang, geminiCfg.key);
        if (result) {
          geminiIndex = (currentIndex + 1) % totalKeys;
          return `${result}`;
        }
      } catch (err) {
        if (!geminiErrorLogged.has(geminiCfg.key)) {
          console.error(
            `⚠️ Gemini error (key ${currentIndex + 1}):`,
            err?.message || err
          );
          geminiErrorLogged.set(geminiCfg.key, true);
        }
      }
    }
  }

  // --- GOOGLE TRANSLATE ---
  if (config.apiKey.google?.active) {
    try {
      result = await translateWithGoogle(text, finalLang);
      if (result) return `${result}`;
    } catch (err) {
      console.error('Google Translate error:', err.message);
    }
  }

  // --- MYMEMORY ---
  if (config.apiKey.mymemory?.active) {
    try {
      result = await translateWithMyMemory(text, finalLang);
      if (result) return `[MyMemory]: ${result}`;
    } catch (err) {
      console.error('MyMemory error:', err.message);
    }
  }

  return `❌ Gagal menerjemahkan ke ${finalLang}`;
}
