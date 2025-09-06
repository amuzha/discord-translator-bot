import { GoogleGenerativeAI } from '@google/generative-ai';

export async function translateWithGemini(text, targetLang, apiKey) {
  try {
    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Detect the language of the following text and translate it to ${targetLang}.
Return JSON only:
{"source_lang":"<code>","translation":"<translated text>"}

Text:
${text}`;

    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text()?.trim() || '';

    const match = responseText.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const data = JSON.parse(match[0]);
    if (data && typeof data.translation === 'string') {
      return data.translation.trim();
    }
    return null;
  } catch (err) {
    console.error('Gemini translate error:', err?.message || err);
    return null;
  }
}
