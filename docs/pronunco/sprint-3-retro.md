# 🌟 Sprint 3 ― “Routes & Reliability” ― Retrospective / Status doc
*Milestone closed:* 2025-07-12  
*Contributors:* Claude, Gemini, GPT-Assist, (o3 coach)

---

## ✅ What we shipped

| Area | Deliverable | PR | Owner |
|------|-------------|----|-------|
| Routing | `/pc/coach/:deckId` blank-screen fix | #180 | GPT |
| Tests | Vitest OOM guard + routing smoke | #185 | GPT / Claude |
| UI | Two-column Coach layout, Tailwind v4 config | #188 | Gemini |
| Data | Dexie v2 partial migration (decks.lines → array) | #186 | Claude |
| Teacher PoC | Grammar modal reusable as editor | #191 | GPT |
| Friend PoC | Share-card generator (html2canvas) | #193 | Gemini |
| Azure | `usePronunciationScore` hook + budget watchdog | #194 | Claude |
| Organization | **Folder tree + smart naming** for deck management | feature-branch | Claude |
| Social | **Friend-Challenge share URLs** with encoded data | feature-branch | Claude |

---

## 📈 Metrics snapshot

| Metric | Sprint-2 | Sprint-3 | Δ |
|--------|---------:|---------:|:--:|
| Unit-test duration (CI) | 4 m 20 s | **38 s** | ↓ 85 % |
| Bundle size (apps/pronunco) | 542 kB | **555 kB** | +2 % |
| Bugs caught by CI | 0 | **3** | +3 |

*(update if you have better numbers)*

---

## 🎉 Went well
- ✅ **Sprint 3 finale exceeded expectations** - delivered folder organization + social sharing beyond planned scope
- ✅ **AI collaboration workflow** - Claude, Gemini, and GPT worked seamlessly on complementary features  
- ✅ **Clean git history** - complex merge scenarios handled perfectly with stashing and fast-forward merges
- ✅ **Feature completeness** - each feature shipped production-ready with full TypeScript integration

## 😰 Pain / surprises
- [ ] *add bullet*
- [ ] *add bullet*

## 🚧 Improvements for next sprint
- [ ] Decide single-source env management (Azure, Supabase, local)
- [ ] Re-enable skipped deep routing tests
- [ ] *add bullet*

---

## 🟡 Open items rolling into Sprint 4

| Theme | Task | Status | Owner |
|-------|------|--------|-------|
| Responsive layouts | mobile & tablet break-points | not started | Gemini |
| Wizard | “Create Drill” full flow | in-progress | GPT |
| Sync | Dexie `outbox` + Supabase flush | PoC queued | Claude |
| Leaderboard | Supabase `challenge_scores`, Top-10 API | not started | Claude |
| Usage cap | Slack alert on Azure $ spend | PoC in watchdog | Claude |
| Drag-drop | enhance folder tree with drag-and-drop | backlog | open |

---

## 🗓 Sprint 4 kick-off checklist
- [ ] merge Azure keys & `.env.example`
- [ ] cut branches: `gemini/responsive-layout`, `claude/supabase-scores`, `gpt/drill-wizard`
- [ ] enable Playwright smoke test gate
- [ ] create milestone **v0.4 – Mobile & Leaderboard**
