import { translate } from '@vitalets/google-translate-api';

export async function translateWithGoogle(text, targetLang) {
  try {
    const res = await translate(text, { to: targetLang });
    return res.text;
  } catch (err) {
    console.error('Google Translate API error:', err.message);
    return null;
  }
}
