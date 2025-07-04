# Sober-Body™ Modular Framework — Top‑Level White‑Paper

**Version 0.2 · DRAFT for collaborative branching**\
**Date:** 18 June 2025\
**Maintainer:** Alex Sudakov (+ open‑source contributors)

---

## Purpose & Scope

This file is the **constitutional charter** for every other Sober‑Body document. It lays down the shared vocabulary, module borders, and data‑flow rules that let independent working groups build plug‑ins, content packs, or native shells **without endangering** the medically compliant core.

---

## 1 · Document Map

| WP ID    | Title                                       | Primary Owner      | Status   |
| -------- | ------------------------------------------- | ------------------ | -------- |
| **WP‑0** | **Top‑Level Modular Framework (this file)** | Core Maintainers   | **v0.2** |
| **WP‑1** | Compliant Core — Algorithms & Privacy       | Medical / Legal WG | draft    |
| **WP‑2** | Global Stats & Cultural Insights Pack       | Research WG        | draft    |
| **WP‑3** | Literary / Folklore & Pop‑Culture Pack      | Copywriting WG     | draft    |
| **WP‑4** | Humor & Banter Feeds                        | Comedy WG          | draft    |
| **WP‑5** | Engagement Modules (Games, Challenges)      | UX / Game WG       | draft    |
| **WP‑6** | Inter‑Module Messaging & Policy Filters     | Platform WG        | draft    |

*Sub‑papers live in their own repo branches. Major edits here cascade version numbers downstream.*

---

\## 2 · System Composition (30 000‑ft)

```
 ┌────────────────────────────────────────────┐
 │  PWA / MOBILE SHELL  (React‑Native / PWA) │
 └┬───────────────────────────────────────────┘
  │ Event Bus  ⇄  permission gate  (WP‑6)    
┌─▼────────────────────────────┐
│     WP‑1  Compliant Core     │   (sandbox)
└─┬────────────────────────────┘
  │ publishes: BAC_EST, RISK_FLAG, METAB_LOAD
  │ subscribes: SENSOR_DATA, USER_PREF        
┌─▼───────────────────────────┐
│ WP‑5  Engagement Modules    │
└─┬──────────┬──────────┬─────┘
┌─▼────────┐ ┌▼────────┐ ┌▼────────┐
│ WP‑2     │ │ WP‑3    │ │ WP‑4    │
└──────────┘ └──────────┘ └─────────┘
```

*Default flow: Core can ****ingest**** anything; outbound medical data is filtered by WP‑6 before reaching non‑compliant modules.*

---

\## 3 · Technology Guard‑Rails ### 3.1 Language & Packaging Strategy

| Phase                   | Runtime core                           | Tool‑chain & distribution                                                                |
| ----------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| **1 (MVP)**             | **TypeScript** inside React‑Native/PWA | Fast AI‑assisted dev; no native build required; published as PWA & Expo bundles          |
| **2 (Perf & Security)** | **Rust → WASM** drop‑in                | Same public API; compiled WASM loaded by JS; gains deterministic maths & Ed25519 signing |
| **3 (Research / CLI)**  | Python reference core                  | Optional for data‑science notebooks                                                      |

Node.js is **dev‑time only** for bundling & tests; production Node/Electron shells are optional extras (see §3.2).

\### 3.2 Runtime Footprints & Optional Shells

| Footprint                      | When it’s used                                            | Extra powers                                                 |
| ------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------ |
| **Pure PWA** (default)         | MVP launch on web & mobile; offline via service‑worker    | Web Bluetooth (Chrome / Edge / Android), IndexedDB, Push API |
| **iOS Native Wrapper** (Swift) | Needed for HealthKit HRV, BLE on iOS, share‑sheet exports | Distributed via App Store when ready                         |
| **Electron / Tauri Table‑Hub** | Kiosk tablets in bars; corporate desktop installs         | Full BLE/USB stack, wake‑lock, auto‑wipe sessions            |

\### 3.3 Content Ratings

| Tag             | Purpose                                                        | Defaults                                     |
| --------------- | -------------------------------------------------------------- | -------------------------------------------- |
| **MED**         | Clinical & legal text                                          | Always on                                    |
| **PG13**        | Light humour                                                   | Party / Dorm presets                         |
| **ADULT**       | Edgy or mature humour                                          | Explicit opt‑in                              |
| **PRIVATE\_CX** | **Encrypted, organisation‑only** educational or policy content | Visible only inside signed corporate presets |

\### 3.4 Pack Manifest Snippet

```yaml
module_id: humorpak.en-US.v1
visibility: public          # public | org | private
needs:   [LANG, TIME_OF_DAY]
outputs: [TOAST]
forbidden_inputs: [BAC_EST, RISK_FLAG]
```

---

\## 4 · Governance Model

1. **Core Maintainers** own WP‑0/1 & the bus protocol.
2. **Working Groups (WG)** iterate their WPs; merge via PR & checklist (medical sign‑off for MED text).
3. **Certification path** — Experimental module → review → *certified* ⇒ gets looser data permissions.

---

\## 5 · Messaging Principles & Policy Profiles *Pub/Sub JSON envelopes over the internal Event Bus.*

```json
{
  "topic": "BAC_EST",
  "payload": { "value": 0.07, "err": 0.02 },
  "policy": "standard"
}
```

\### Policy Profiles

| Profile                                                                                       | Outbound medical granularity          | Typical scenario                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------- |
| **strict**                                                                                    | fuzzy ranges only (low/med/high)      | Corporate compliance or app‑store review       |
| **standard**                                                                                  | rounded BAC, risk flags               | Default for public release                     |
| **offline\_relaxed**                                                                          | full precision BAC & metabolite curve | User toggles when off‑grid or in research beta |
| Profiles load from a signed JSON at start‑up.  Certified modules may request elevated scopes. |                                       |                                                |

---

\## 6 · Road‑Map Snapshot (updated)

| Quarter     | Milestones                                                           |
| ----------- | -------------------------------------------------------------------- |
| **Q3 2025** | Finish WP‑1 draft · PWA MVP (TypeScript) · First mini‑game           |
| **Q4 2025** | Dorm & bar pilots (PWA) · Swift wrapper beta · Policy profile engine |
| **Q1 2026** | Electron Table‑Hub · Certified corporate preset + PRIVATE\_CX packs  |
| **Q2 2026** | Rust→WASM core swap‑in (v2) · Public App‑Store launch                |

---

\## 7 · Next Actions

1. Review the **Policy Profile** table; suggest tweaks.
2. WG leads spin up draft WPs 2‑6 using this template.
3. Core team begins MVP PWA scaffold (`react‑native‑web + expo + idb`).

---

*(end of WP‑0 v0.2)*

