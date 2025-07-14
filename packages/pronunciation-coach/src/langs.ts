export const LANGS = [
  { code: 'en-US', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'he-IL', label: 'עברית' },
  { code: 'ru-RU', label: 'Русский' }
] as const;
export type LangCode = typeof LANGS[number]['code'];
