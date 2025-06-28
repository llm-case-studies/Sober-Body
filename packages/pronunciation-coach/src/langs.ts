export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt-BR', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'zh-Hans', label: 'Chinese (Simplified)' }
] as const;
export type LangCode = typeof LANGS[number]['code'];
