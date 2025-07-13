---  
version: 0.1-draft  
status: living  
---
# WP-4 · Go-To-Market & Monetization

## 1 Tier matrix
| Feature | Free | Pro ($9/mo) |
|---------|------|-------------|
| Local scoring | ✔ | ✔ |
| Azure scoring | ✖ | ✔ |
| Deck export/import | ✔ | ✔ |
| Unlimited custom decks | ⚠ 5 / mo | ✔ |
| Teacher dashboard | ✖ | ✔ |

## 2 Acquisition channels
* Challenge link virality  
* SEO blog – “pronounce Portuguese R sound”  
* Teacher affiliate (30 % rev-share)

## 3 Pricing rationale
Azure cost ≈ \$0.0004 / 15-sec clip ⇒ break-even at ~1 k clips / user / mo.

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
