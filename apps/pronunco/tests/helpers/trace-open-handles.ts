import { afterAll } from 'vitest';

/** Activates a 1-s interval that prints open Node handles.
 *  Only runs when DEBUG_HANDLES=true is present in env. */
export function traceOpenHandles() {
  if (process.env.DEBUG_HANDLES !== 'true') return;

  const tick = setInterval(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore private API – fine for local debug
    const list = (process as any)._getActiveHandles?.() ?? [];
    // eslint-disable-next-line no-console
    console.log(
      '🕒 still alive –',
      list.length,
      'handle(s):',
      list.map((h: any) => h.constructor?.name ?? 'Unknown'),
    );
  }, 1_000);

  afterAll(() => clearInterval(tick));
}
