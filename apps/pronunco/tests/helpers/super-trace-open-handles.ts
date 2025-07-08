import { afterAll, beforeAll } from 'vitest';

// ── Side-effect tracer: runs automatically when file is imported ──
if (process.env.DEBUG_HANDLES === 'true') {

/**
 * Streams:
 * • a light “ticker” every 0.5 s so you know the loop is alive.
 * • a full handle dump via wtfnode every 3 s.
 * Automatically disabled unless DEBUG_HANDLES=true.
 */
  const tick = setInterval(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore private API
    const handles = (process as any)._getActiveHandles?.() ?? [];
    console.log(
      `🕑 ${new Date().toLocaleTimeString()} – ${handles.length} live handle(s)`,
      handles.map((h: any) => h.constructor?.name ?? 'Unknown'),
    );
  }, 500);

  // Heavy dump
  let dump: NodeJS.Timeout | null = null;
  beforeAll(async () => {
    const { dump: wtfDump } = await import('wtfnode');
    dump = setInterval(() => {
      console.log('===== WTFNODE DUMP START =====');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      wtfDump();                            // full handle + stack summary
      console.log('=====  WTFNODE DUMP END  =====');
    }, 3_000);
  });

  afterAll(() => {
    clearInterval(tick);
    dump && clearInterval(dump);
  });
}
