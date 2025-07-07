/** Diagnostic helper: prints open Node handles after each file and forces exit. */
import { afterAll } from 'vitest';

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore private API – fine for local debug
  const handles: any[] = process._getActiveHandles?.() ?? [];

  if (handles.length) {
    console.log('\n🔍  Open handles keeping Vitest alive:');
    handles.forEach((h, i) => console.log(`  ${i + 1}. ${h.constructor?.name ?? 'Unknown'}`));
  } else {
    console.log('\n✅  No open handles detected.');
  }

  // guarantee process exits so CI/local shell doesn’t hang
  setTimeout(() => process.exit(0), 50);
});
