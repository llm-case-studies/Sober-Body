## ─────────────────────────────────────────────────────────
#  Business Roadmap (PronunCo) – v0.4+ draft
#
#  Theme | Feature / Deliverable | “Why it matters”
#  -------------------------------------------------------
#  Core speech engine
#  • Azure Pronunciation Assessment (cloud scoring, heat-map) | Unlocks CEFR-grade feedback & paid tier differentiation
#  -------------------------------------------------------
#  Data & storage
#  • Finish Dexie v1 rollout (migrate old pc_decks blob, per-app DB) | Future-proofs multi-app deploys; real per-deck deletes
#  • Per-deck progress & score history table | Enables progress badge, teacher reports, adaptive drills
#  -------------------------------------------------------
#  UI / UX
#  • Responsive layouts (phone / tablet) | 40-50 % users drill on mobile
#  • Icon + tooltip component (🏠 Manage, 🏆 Challenge, 📖 Brief …) | Reduces onboarding friction
#  • Teacher Brief drawer polish (markdown toolbar, quick ref search) | Improves teacher adoption
#  -------------------------------------------------------
#  Engagement & sharing
#  • Leaderboard back-end (Supabase challenge_scores) | Adds social proof & virality
#  • Topic-Pack marketplace (GitHub Pages CDN / Supabase bucket) | Community growth channel
#  -------------------------------------------------------
#  Monetization
#  • Stripe checkout & “pro” flag (localStorage + JWT stub) | Pays for Azure calls
#  -------------------------------------------------------
#  Docs & onboarding
#  • Fill out WP-2 Architecture diagrams; WP-4 pricing math | Guides new contributors / investors
#  -------------------------------------------------------
#  QA / CI
#  • Cypress smoke test (visit deck → assert first line) | Catches regressions automatically
#  -------------------------------------------------------
#
#  Quick-win bucket (≤ 1 day):
#  – Remember last import folder – Deck progress badge – Add Cypress job to Actions
## ─────────────────────────────────────────────────────────
