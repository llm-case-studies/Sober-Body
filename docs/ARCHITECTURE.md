# Sober‑Body – Developer Architecture Overview

**v0.2 · 23 Jun 2025**
For engineers & AI contributors – see the [Sober‑Body framework paper](./sober-body/sober_body_framework_top_level_whitepaper.md)
and [PronunCo white‑papers](./pronunco/00_index.md) for business context.

---

## 1 · High‑Level Diagram (MVP)

```
┌───────────── Mobile / PWA Shell (React‑Native‑Web / Vite) ──────────────┐
│                                                                         │
│  Event Bus  ⇄  Policy Gate (profile: strict | standard | offline)        │
│                                                                         │
│  ┌─ Compliant Core (WP‑1) ──────────────┐                                │
│  │  bac.ts (TS, later Rust‑WASM)        │  <— sandbox —>                 │
│  │  policy.json loading                 │                                │
│  └──────────────────────────────────────┘                                │
│                                                                         │
│  Features/Modules                                                        │
│  ├─ core/    🩸 Widmark + future ML                                       │
│  ├─ games/   🎮 ReactionTap, Stroop                                      │
│  └─ group/   👥 QR join + WebSocket hub                                  │
│                                                                         │
│  Storage: IndexedDB (idb‑keyval) – drink log & settings persistence      │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2 · Tech Stack Versions

| Layer   | Tech                                | Notes                                  |
| ------- | ----------------------------------- | -------------------------------------- |
| UI      | **React 18 + TypeScript 5**         | Vite dev server, Tailwind optional     |
| State   | Context → Redux Toolkit (future)    | TBD after DrinkButtons                 |
| Storage | **IndexedDB** via `idb-keyval@6`    | drink log & settings, in‑memory for tests |
| Core    | TS → **Rust 1.79 → WASM** (phase 2) | FFI boundary typed via ts‑wasm‑bindgen |
| Tests   | **Vitest 1.6** + jsdom              | Live in `src/**/__tests__`             |
| CI      | GitHub Actions Node 20              | see `ci.yml`                           |

---

## 3 · Event Bus Contract (excerpt)

```ts
interface BusEnvelope<TPayload> {
  topic: "BAC_EST" | "DRINK_ADDED" | "RISK_FLAG";
  payload: TPayload;
  profile: "strict" | "standard" | "offline_relaxed";
}
```

*Core publishes BAC\_EST (value, error±), modules subscribe.*

---

## 3 · Monorepo Layout

```
/               # repo root
├─ apps/
│   └─ sober-body/            # main PWA
├─ packages/
│   └─ pronunciation-coach/   # coach playground
└─ pnpm-workspace.yaml        # workspace config
```

Start both dev servers with `pnpm run dev:all`.

---

## 4 · Build Commands

| Script          | What it does                                                      |
| --------------- | ----------------------------------------------------------------- |
| `pnpm dev:sober`   | Vite hot-reload at http://localhost:5173 |
| `pnpm dev:coach`   | Coach playground at http://localhost:5174 |
| `pnpm dev:all`    | Run both servers concurrently |
| `pnpm test`       | Vitest suite |

---

## 5 · Future Milestones

1. **Phase 1** – TS PWA + local storage (Q3 2025).
2. **Phase 2** – Rust/WASM core swap + iOS/Android wrappers (Q2 2026).
3. **Phase 3** – Cloudless Group Mode scaling, plugin marketplace (2026‑H2).

---

## Deck-v2 (Dexie)

Deck data is stored in Dexie tables. Import helpers keep the legacy `idb-keyval`
blob in sync for older builds. Dexie tables:

- `decks`: `id`, `title`, `lang`, `category`, `updatedAt`
- `cards`: `id`, `deckId`

Import helpers use Dexie transactions and keep the legacy blob in sync.

---

*End of file*
