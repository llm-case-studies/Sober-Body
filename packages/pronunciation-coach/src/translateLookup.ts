export function getLookup(e: MouseEvent): string {
  const sel = window.getSelection()?.toString().trim();
  const raw = sel ? sel : (e.target as HTMLElement).innerText;
  return raw.replace(/[^\p{L}\p{N}\s]+/gu, '');
}
