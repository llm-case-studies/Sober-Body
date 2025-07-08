### Context
Re-enabled all PronunCo tests; now 5 files are failing (no hangs).

### Failing suites
- clear-decks.test.tsx – “Groceries” not found
- coach-page.test.tsx – prompt “hello” not rendered
- deck-manager.navigate.test.tsx – label “Select A” not found
- drill-link.test.tsx – deck prop undefined
- storage-hooks.test.tsx – Dexie snapshot empty

### Task list
- [ ] Update seed/mocks so expected elements render.
- [ ] Pass required props (`deck`) in DrillLink test or loosen assertion.
- [ ] Ensure Dexie writes finish before hook assertion (use `await` or `waitFor`).
- [ ] Keep `beforeEach` fake-timer cleanup pattern if timers used.
- [ ] Run `pnpm --filter ./apps/pronunco vitest run` until 0 failures.
CI will fail on the PR (expected); Codex fixes each test and pushes until it’s green.
