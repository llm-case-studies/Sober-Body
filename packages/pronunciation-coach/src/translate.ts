import { cacheTranslation, getCachedTranslation } from './storage'

console.log(
  'ENV DEBUG →',
  import.meta.env.VITE_TRANSLATOR_KEY,
  import.meta.env.VITE_TRANSLATOR_REGION,
  import.meta.env.VITE_TRANSLATOR_ENDPOINT
)

export async function translateAPI(word: string, to: string): Promise<string> {
  const key = import.meta.env.VITE_TRANSLATOR_KEY
  const region = import.meta.env.VITE_TRANSLATOR_REGION
  const endpoint = import.meta.env.VITE_TRANSLATOR_ENDPOINT
  if (!key || !region || !endpoint) {
    throw new Error('Missing VITE_TRANSLATOR_KEY or VITE_TRANSLATOR_REGION')
  }
  const url = `${endpoint}/translate?api-version=3.0&to=${to}`
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

export async function translate(word: string, to: string): Promise<string> {
  const cached = await getCachedTranslation(to, word)
  if (cached) return cached
  const text = await translateAPI(word, to)
  await cacheTranslation(to, word, text)
  return text
}
