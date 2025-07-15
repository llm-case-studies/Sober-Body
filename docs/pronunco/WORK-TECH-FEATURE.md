# PronunCo – Work / Tech Feature Back-Log
↗ [See the Business Roadmap for context on WHY these tasks exist.](./BUSINESS-STRATEGIC.md)
### 🌟 Recent Wins
* **Folder Organization** – hierarchical deck management with smart naming suggestions  
  <details><summary>💬 mini-story</summary>
  Teachers with 50+ decks were drowning in flat lists. Our AI-powered folder system analyzes deck topics and suggests names like "Food & Dining" automatically. Sidebar tree view + move-to-folder dropdowns = organized bliss.
  </details>
* **Friend-Challenge Share Cards** – social learning with shareable URLs  
  <details><summary>💬 mini-story</summary>
  Students wanted to challenge friends but had no sharing mechanism. Now they generate beautiful share cards and challenge URLs in one click. "Beat my score in Airport Phrases!" → viral learning loops.
  </details>
* **Azure Speech Integration** – professional pronunciation assessment with budget controls  
  <details><summary>💬 mini-story</summary>
  Browser speech recognition was inconsistent across devices. Azure gives us CEFR-grade scoring with detailed metrics. $3 daily budget prevents runaway costs while enabling premium features. The breakthrough: side-by-side scoring shows students the difference between "close enough" and "perfect" pronunciation.
  </details>

* **Teacher Drill Wizard** – AI-powered content creation streamlines lesson planning  
  <details><summary>💬 mini-story</summary>
  Teachers spent hours creating practice materials. OpenAI integration generates contextual drills from simple prompts. "Airport vocabulary for intermediate Spanish" becomes 20 ready-to-use phrases in seconds. Grammar modal integration enables instant brief creation.
  </details>

* **Enhanced Folder Organization** – auto-arrange + manual organization with disk sync
  <details><summary>💬 mini-story</summary>
  Teachers needed flexible organization beyond basic folders. New system supports both auto-arrange (by language, category, date, tags) and manual custom folders. Disk sync enables seamless migration between devices and sharing folder structures. "Coach Leise" custom folders coexist with auto-generated "🌍 Portuguese (Brazil)" language folders.
  </details>

* **Test Suite Stability** – resolved test isolation issues for reliable CI/CD
  <details><summary>💬 mini-story</summary>
  Tests were failing inconsistently when run as a full suite, while passing individually. Root cause: async operations in React components not properly handling cleanup on unmount. Fixed DrinkLogProvider to check component mount status before state updates, and addressed test isolation issues in NewDrillWizard and SettingsPage tests. Now 100% of tests pass reliably.
  </details>

* **Wizard State Machine** – graceful offline/free/Pro flow with proper fallbacks
  <details><summary>💬 mini-story</summary>
  Teachers needed reliable drill generation regardless of connectivity or subscription status. Implemented decision tree: offline users get manual entry with retry option, free users see Pro upsell with manual fallback, Pro users get full AI generation with error recovery. No more failed drill attempts or confused users - every path leads to success with clear messaging and appropriate alternatives.
  </details>

* **Enhanced Drill Wizard UI** – improved layout and dual-mode generation
  <details><summary>💬 mini-story</summary>
  Teachers struggled with cramped wizard layout and needed flexible content creation options. Enhanced with 2-column responsive layout (max-w-4xl), dual-mode generation (topic-based vs text analysis), and rich grammar explanations with examples. Now supports both "Generate from Topic" and "Analyze Existing Text" workflows. Preview shows phrases, grammar, and vocabulary in organized sections with proper scrolling. All 10 tests maintained compatibility.
  </details>

* **Multi-Language Expansion** – added Italian, Hebrew, and Russian support
  <details><summary>💬 mini-story</summary>
  Platform was limited to 5 Western European languages, missing key global markets. Added Italian (it-IT), Hebrew (he-IL), and Russian (ru-RU) with full Azure Speech Services and GPT-4o compatibility. Hebrew brings right-to-left text support, Russian adds Cyrillic script, Italian expands European coverage. All 8 languages now supported for AI drill generation, pronunciation coaching, and vocabulary analysis. Tests updated to accommodate dynamic language scaling.
  </details>

| ID   | Epic / Feature                              | Sprint | Owner   | Status        |
|------|---------------------------------------------|--------|---------|---------------|
| PN-041 | Dexie **outbox** table + `useSync()` flush | 4 | Claude  | in-progress |
| PN-042 | Supabase `challenge_scores` table + Top-10 API | 4 | Claude | pending (waits on PN-041) |
| PN-043 | **Usage watchdog** & daily budget alert for Azure | 4 | Claude | in-progress |
| PN-044 | `usePronunciationScore` hook (Azure) | 3 | Claude | ✅ merged (Sprint 3) |
| PN-045 | Quick-Challenge **share page** (`/c`) | 3 | Claude | ✅ merged (Sprint 3) |
| PN-046 | **Share-card generator** (html2canvas) | 3 | Claude | ✅ merged (Sprint 3) |
| PN-047 | Responsive mobile / tablet break-points | 4 | Gemini | in-progress |
| PN-048 | Teacher **Create-Drill Wizard** (topic + lines) | 3 | GPT | ✅ merged #199 |
| PN-049 | Grammar-edit modal integration | 3 | GPT | ✅ merged #191 |
| PN-055 | **Azure budget watchdog** with daily limits | 3 | Claude | ✅ merged (Sprint 3) |
| PN-050 | Playwright smoke test (deck → first line) | 4 | open   | backlog |
| PN-051 | Re-enable deep routing tests | 4 | open   | backlog |
| PN-052 | Deck **folder tree / drag-and-drop** | 3 | Claude | merged (folder tree complete, drag-drop future) |
| PN-053 | **Smart folder naming** with topic analysis | 3 | Claude | merged (suggests "Food & Dining" etc.) |
| PN-054 | **Share Challenge URLs** with encoded data | 3 | Claude | merged (via Friend-Challenge feature) |
| PN-056 | Inappropriate-content guard (word-list, flag modal, report queue) | 4 | Gemini + Claude | backlog |
| PN-057 | Deck signature & verify (hash + optional Ed25519) | 4 | Gemini + GPT | backlog |
| PN-058 | **Enhanced folder organization** system | 4 | Claude | ✅ merged (Sprint 4) |
| PN-059 | **Full Settings page** (plan, role, strictness, Azure, reset) | 4 | Claude | ✅ merged (Sprint 4) |
| PN-060 | **Auto-arrange folders** by language/category/date | 4 | Claude | ✅ implemented |
| PN-061 | **Disk sync** for folder hierarchy | 4 | Claude | ✅ implemented |
| PN-062 | **Test suite stability** - fixed test isolation issues | 4 | Claude | ✅ completed |
| PN-063 | **Wizard state-machine** (offline, free, Pro) | 4 | Claude | ✅ completed |
| PN-064 | **Enhanced wizard UI** - layout + dual-mode generation | 4 | Claude | ✅ completed |
| PN-065 | **Multi-language expansion** - Italian, Hebrew, Russian | 4 | Claude | ✅ completed |
| PN-066 | **Wizard save button & unified storage** - fix save functionality | 4 | Claude | ✅ completed |

## 🎯 Phase 1 - Immediate Improvements (Next Sprint)

| ID   | Feature                                  | Priority | Owner   | Status    |
|------|------------------------------------------|----------|---------|-----------|
| PN-067 | **Folder counter bug fix** - reactive updates | High | Claude | pending |
| PN-068 | **JSON import/export** for selected decks | High | Claude | pending |

## 🚀 Phase 2 - Enhanced Content Management 

| ID   | Feature                                  | Priority | Owner   | Status    |
|------|------------------------------------------|----------|---------|-----------|
| PN-069 | **Extended deck editor** - text/vocab/grammar/categories/difficulty | High | Claude | pending |
| PN-070 | **Enhanced coach page tabs** - drill/vocab/grammar sections | High | Claude | pending |
| PN-071 | **Custom user tags** system beyond folders | Medium | Claude | pending |

## 🌟 Phase 3 - Advanced Features

| ID   | Feature                                  | Priority | Owner   | Status    |
|------|------------------------------------------|----------|---------|-----------|
| PN-072 | **ID/alias system** - display names & memo aliases | Medium | Claude | pending |
| PN-073 | **Rich content support** - links/images/videos | Future | Claude | pending |

> **Legend**  
> *merged # xxx* – already on main  
> *in-progress* – branch open this sprint  
> *backlog* – should land before Sprint 4 closes  
> *ice-box* – nice-to-have, no capacity yet

### Backlog

* [Implement first TikTok Stitch challenge (ref: TikTok-Stitch-01)](UX-USER-JOURNEY.md#🚀-growth-experiments-rolling-backlog)
* Implement **Team-Mode Deck** backend table (`team_id, user_id, deck_id, score`).
* Build **Share Link** generator & handler route.
* Add **Embed Leaderboard** endpoint (`/embed/leaderboard/:slug`) – no auth.

| Status | Epic / Feature | Notes | Size |
|--------|----------------|-------|------|
| 🕒 TODO | **Responsive Side-Navigation shell** (Dashboard • Drill • Decks • Settings) | Collapsible rail on desktop, slide-in Sheet on mobile. Lays groundwork for future Dashboard & Leaderboard pages. | Medium |
