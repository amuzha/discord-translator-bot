import fetch from 'node-fetch';

export async function translateWithMyMemory(text, targetLang) {
  try {
    const detectUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|id`;
    const detectResp = await fetch(detectUrl);
    const detectData = await detectResp.json();
    const detectedSource =
      detectData?.matches?.[0]?.source ? detectData.matches[0].source : null;
    const detectedLang = detectedSource ? detectedSource.slice(0, 2).toLowerCase() : 'id';

    if (detectedLang === targetLang) return text;

    const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${detectedLang}|${targetLang}`;
    const resp = await fetch(translateUrl);
    const data = await resp.json();

    const t = data?.responseData?.translatedText;
    return typeof t === 'string' ? t : text;
  } catch (e) {
    console.error('MyMemory error:', e?.message || e);
    return text;
  }
}
