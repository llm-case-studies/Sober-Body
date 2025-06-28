import { get, set } from 'idb-keyval'

const PREFIX = 'pc_vocab_'

export async function getCachedTranslation(lang: string, word: string): Promise<string | undefined> {
  const store = await get<Record<string, string>>(PREFIX + lang)
  return store?.[word.toLowerCase()]
}

export async function cacheTranslation(lang: string, word: string, text: string): Promise<void> {
  const key = PREFIX + lang
  const obj = (await get<Record<string, string>>(key)) ?? {}
  obj[word.toLowerCase()] = text
  await set(key, obj)
}
