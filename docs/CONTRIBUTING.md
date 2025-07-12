# Contributing Guide – Sober‑Body Repo

**v0.2 · 23 Jun 2025**
Keeper: Alex S.

---

## 1 · Scope

This document explains **how humans *and* AI agents (Codex/Copilot)** should interact with the repository.  It is stable – back-log entries live in `docs/*/WORK-TECH-FEATURE.md`.
See `docs/AI-COLLAB.md` for multi-AI workflow.

---

## 2 · Coding Rules

1. **Conventional commits**: `feat(ui): …`, `fix(core): …`, `test(core): …`, etc.
2. **PR size**: ≤ 200 LOC (diff), one behaviour per PR.
3. **Tests**: every PR must keep `pnpm -r test` green. New features require Vitest tests.
4. **Lint/format**: run `pnpm -r lint` (ESLint + Prettier); CI will fail otherwise.
5. **CI**: GitHub Actions in `.github/workflows/ci.yml` must pass.
6. **Docs**: Update `BACKLOG.md` check‑box and relevant white‑paper links if scope changes.

---

## 3 · Repository Layout (TL;DR)

```
docs/
  ├─ CONTRIBUTING.md       # ← you are here
  ├─ BACKLOG.md            # evolving task list
  ├─ ARCHITECTURE.md       # dev‑facing design
  ├─ sober-body/           # WP-0 … WP-n
  └─ pronunco/             # PronunCo docs
apps/sober-body/           # Vite React‑TS PWA
packages/pronunciation-coach/  # Coach playground
```

---

## 4 · PR Workflow (human & AI)

1. **Fork/Branch**: feature branches use kebab‑case (`feat/drink-buttons`). AI: use `codex/<summary>`.
2. **Issue first**: open or self‑assign a GitHub issue, reference it in your PR.
3. **Description**: Copilot PR helper or manual markdown. Link tests, screenshots.
4. **Reviewers**: tag @alex‑s for final merge.

---

## 5 · Using Codex/Copilot Chat

*Before coding, prompt:*

> “Read docs/CONTRIBUTING.md and docs/BACKLOG.md.”

Common prompts:

| Intent        | Prompt                                                                               |
| ------------- | ------------------------------------------------------------------------------------ |
| **Add tests** | “Create Vitest tests for bac.ts edge cases; commit `test(core): add edge cases`.”    |
| **New UI**    | “Scaffold React component DrinkButtons (Beer, Wine, Shot) per docs/BACKLOG.md item.” |
| **Refactor**  | “Refactor estimateBAC to return both value and errorMargin; update tests.”           |
| **Docs**      | “Append new unchecked bullet to BACKLOG.md under ‘feat(ui)’.”                        |

---

## 6 · Contact

*Lead maintainer:* Alex S. [alex@example.test](mailto:alex@example.test)

---

*End of file*
