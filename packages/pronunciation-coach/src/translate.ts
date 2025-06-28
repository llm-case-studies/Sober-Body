import { cacheTranslation, getCachedTranslation } from './storage'

export async function translateAPI(word: string, lang: string): Promise<string> {
  const key = (import.meta as any).env.VITE_TRANSLATOR_KEY
  const region = (import.meta as any).env.VITE_TRANSLATOR_REGION
  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${lang}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': region,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{ text: word }])
  })
  const data = await res.json()
  return data[0].translations[0].text as string
}

export async function translate(word: string, lang: string): Promise<string> {
  const cached = await getCachedTranslation(lang, word)
  if (cached) return cached
  const text = await translateAPI(word, lang)
  await cacheTranslation(lang, word, text)
  return text
}
