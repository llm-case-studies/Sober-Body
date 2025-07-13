## ─────────────────────────────────────────────────────────
#  Business Roadmap (PronunCo) – v0.4+ draft
#
### 🌟 Recent Wins
* **Professional Speech Assessment** – Azure integration unlocks CEFR-grade feedback  
  <details><summary>💬 marketing story</summary>
  "Finally, pronunciation coaching that doesn't guess." Teachers were frustrated with browser speech recognition giving different scores on identical pronunciation. Our Azure integration delivers consistent, professional-grade assessment with detailed breakdowns (accuracy, fluency, completeness) plus cost controls. Students now trust their scores—and pay for premium features.
  </details>

* **Social Learning Revolution** – One-click challenge sharing transforms individual practice into viral loops  
  <details><summary>💬 marketing story</summary>
  "From solitary drilling to friendly competition in one click." Students practiced alone, teachers couldn't engage beyond assignments. Now anyone can generate a beautiful challenge card and shareable URL: "Beat my 95% on Airport Phrases!" The encoded challenge data works anywhere, creating organic growth through friendly competition.
  </details>

* **Deck Chaos to Organization** – Smart folder system with AI-powered naming rescues teachers from content overwhelm  
  <details><summary>💬 marketing story</summary>
  "50 decks, 5 seconds to find the right one." Language teachers were drowning in flat lists of practice materials. Our hierarchical folder system analyzes existing content patterns and suggests intelligent names like "Food & Dining" or "Business & Professional." Sidebar tree navigation + drag-to-organize = content management that scales with success.
  </details>

#  Theme | Feature / Deliverable | "Why it matters"
#  -------------------------------------------------------
#  Core speech engine ✅ COMPLETED SPRINT 3
#  • ✅ Azure Pronunciation Assessment (cloud scoring, heat-map) | DELIVERED: Professional CEFR-grade feedback + paid tier ready
#  • ✅ Budget controls & usage tracking | DELIVERED: $3 daily limits prevent runaway Azure costs
#  -------------------------------------------------------
#  Content Organization ✅ COMPLETED SPRINT 3  
#  • ✅ Hierarchical folder system | DELIVERED: Teachers can organize 50+ decks effortlessly
#  • ✅ Smart AI naming suggestions | DELIVERED: Auto-suggests "Food & Dining" based on content analysis
#  • ✅ Move-to-folder workflow | DELIVERED: Drag-drop style organization via dropdown menus
#  -------------------------------------------------------
#  Social & Viral Features ✅ COMPLETED SPRINT 3
#  • ✅ Challenge sharing URLs | DELIVERED: One-click "Beat my score!" challenge generation  
#  • ✅ Social media share cards | DELIVERED: Beautiful PNG cards for viral distribution
#  • ✅ Friend competition tracking | DELIVERED: Encoded challenge data works anywhere
#  -------------------------------------------------------
#  Data & storage (SPRINT 4 FOCUS)
#  • Finish Dexie v1 rollout (migrate old pc_decks blob, per-app DB) | Future-proofs multi-app deploys; real per-deck deletes
#  • Per-deck progress & score history table | Enables progress badge, teacher reports, adaptive drills
#  -------------------------------------------------------
#  UI / UX (SPRINT 4 PRIORITY)
#  • Responsive layouts (phone / tablet) | 40-50 % users drill on mobile - CRITICAL PATH
#  • Icon + tooltip component (🏠 Manage, 🏆 Challenge, 📖 Brief …) | Reduces onboarding friction
#  • Teacher Brief drawer polish (markdown toolbar, quick ref search) | Improves teacher adoption
#  -------------------------------------------------------
#  Engagement & sharing (SPRINT 4+)
#  • Leaderboard back-end (Supabase challenge_scores) | Builds on completed challenge system for social proof & virality
#  • Topic-Pack marketplace (GitHub Pages CDN / Supabase bucket) | Leverage folder organization for community growth channel
#  • Growth Experiment implementation | Medium priority
#  -------------------------------------------------------
#  Monetization (READY FOR IMPLEMENTATION)
#  • Stripe checkout & "pro" flag (localStorage + JWT stub) | Pays for Azure calls - FOUNDATION COMPLETE
#  • Premium tier differentiation | Azure scoring + folder organization + challenge analytics create clear value props
#  • Usage-based pricing model | Budget tracking system enables transparent per-assessment billing
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
## 💡 Vision & Go-to-Market

↗ Growth backlog lives in [UX-USER-JOURNEY.md ▸ Growth Experiments](UX-USER-JOURNEY.md#🚀-growth-experiments-rolling-backlog)

## 2 Acquisition channels
* Challenge link virality
* SEO blog – “pronounce Portuguese R sound”
* Teacher affiliate (30 % rev-share)

## 4 Launch timeline
* **Beta** – Sep 2025 (invite teachers)
* **Public** – Nov 2025

## Q3 2025 Priorities _(Founder update — July 2025)_

| Rank | Epic | Outcomes | Docs link |
|------|------|----------|-----------|
| **1** | **Finalize Dexie migration** (per-app DBs) | Smooth deck import/delete; sets stage for multi-PWA deployment. | See WP-2 §3 |
| **2** | **Azure Pronunciation Assessment (Pro toggle)** | Cloud-grade accuracy → justifies subscription tier.  | WP-3 §4 |
| **3** | **Responsive mobile UX pass** | 40-50 % of users drill on phones; improves retention. | WP-2 §3 UI layer |
| **4** | **Per-deck progress tracking** | Badges & teacher reports; unlocks leaderboard later. | WP-3 §5 |
| **5** | **Cypress smoke test in CI** | Guards against deck-selection regressions. | Internal QA ADR |

_Note: Leaderboard & marketplace remain stretch goals for Q4 unless Azure toggle
ships early and costs remain within CAC < $0.60 per activated user._

*Added by Founder chat — preserves long-horizon context while Dev-lead tackles implementation details in Sprint #3.*
## Risk & Trust
- Ship kid-safe filter + teacher-signed decks to reassure schools & parents.

↗ See UX – User Journey for personas and funnel.
