# WP-5 Engagement Modules

**Version 0.1 · Draft**
**Date:** 23 Jun 2025

This paper outlines optional games that boost user stickiness while keeping the compliant core untouched. All modules communicate via the Event Bus.

## Planned Mini-Games

- **Reaction Tap** – baseline reflex check.
- **Stroop Swipe** – colour-word confusion task.
- **Pronunciation Challenge** – tongue‑twister using SpeechRecognition. Emits `PRONUN_SCORE` events for later ML analysis.

Modules are loaded by policy and may be disabled in strict profiles.

---
*End of file*
