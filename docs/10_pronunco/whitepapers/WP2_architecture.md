---  
version: 0.1-draft  
status: stable once refactor lands  
---
# WP-2 · Architecture & Data

## 1 Workspace layout
apps/ # PWA front-ends
├─ sober-body/ # BAC + twisters
└─ pronunco/ # pronunciation coach UI
packages/
└─ core-speech/ # shared deck / scoring / zip / challenge logic

## 2 Core schema (shared)
*Deck*, *Brief*, *Ref*, *Challenge* → see `docs/shared/deck-schema.md`.

## 3 Data flow
[UI] ↔ core-speech ↔ IndexedDB (offline)
↘ Azure Speech (Pro)

## 4 Build & deploy
* pnpm workspaces  
* Vite + React 18 + Tailwind  
* GitHub Actions → IONOS VPS (Nginx)  
