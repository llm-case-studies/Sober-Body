---
title: UI Vocabulary Decks
status: draft
sprint: 4
owner: shared (Claude + Gemini)
---

# UI Vocabulary Decks

A lightweight deck system for teaching the app interface in different languages. Students can review key phrases like **Play**, **Next**, and **Record** before using the coach.

## Goals
- Provide starter vocabulary for UI elements.
- Allow progressive difficulty levels (Beginner, Intermediate, Advanced).
- Ship seed JSON for PT‑BR as proof of concept.

## MVP Implementation Plan

| Step | Task | Owner |
| --- | --- | --- |
| 1 | Define JSON format for UI terms | Claude |
| 2 | Seed PT-BR beginner deck | Gemini |
| 3 | Render deck in a simple `<UIVocabDeck>` component | Claude |
| 4 | Link from coach page tabs | Gemini |
| 5 | Gather feedback & refine difficulty tiers | shared |

