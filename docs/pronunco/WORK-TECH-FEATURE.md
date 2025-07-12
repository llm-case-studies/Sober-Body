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
  Browser speech recognition was inconsistent across devices. Azure gives us CEFR-grade scoring with detailed metrics. $3 daily budget prevents runaway costs while enabling premium features.
  </details>

| ID   | Epic / Feature                              | Sprint | Owner   | Status        |
|------|---------------------------------------------|--------|---------|---------------|
| PN-041 | Dexie **outbox** table + `useSync()` flush | 4 | Claude  | in-progress |
| PN-042 | Supabase `challenge_scores` table + Top-10 API | 4 | Claude | pending (waits on PN-041) |
| PN-043 | **Usage watchdog** & daily budget alert for Azure | 4 | Claude | in-progress |
| PN-044 | `usePronunciationScore` hook (Azure) | 4 | Claude | merged #194 |
| PN-045 | Quick-Challenge **share page** (`/c`) | 4 | Gemini | merged #193 |
| PN-046 | **Share-card generator** (html2canvas) | 4 | Gemini | merged #193 |
| PN-047 | Responsive mobile / tablet break-points | 4 | Gemini | in-progress |
| PN-048 | Teacher **Create-Drill Wizard** (topic + lines) | 4 | GPT | in-progress |
| PN-049 | Grammar-edit modal integration | 4 | GPT | merged #191 |
| PN-050 | Playwright smoke test (deck → first line) | 4 | open   | backlog |
| PN-051 | Re-enable deep routing tests | 4 | open   | backlog |
| PN-052 | Deck **folder tree / drag-and-drop** | 3 | Claude | merged (folder tree complete, drag-drop future) |
| PN-053 | **Smart folder naming** with topic analysis | 3 | Claude | merged (suggests "Food & Dining" etc.) |
| PN-054 | **Share Challenge URLs** with encoded data | 3 | Claude | merged (via Friend-Challenge feature) |

> **Legend**  
> *merged # xxx* – already on main  
> *in-progress* – branch open this sprint  
> *backlog* – should land before Sprint 4 closes  
> *ice-box* – nice-to-have, no capacity yet
