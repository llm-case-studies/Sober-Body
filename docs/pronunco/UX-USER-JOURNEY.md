# UX – User Journey & Personas (Living Doc)

## 1. Personas
| Persona | Goals | Pain points | Pro features/cues |
|---------|-------|-------------|-------------------|
| Casual learner “Anna” | ... | ... | Azure heat-map feedback |
| ESL Teacher “Mr. Kim” | ... | ... | Bulk deck share, leaderboard |

## 2. Acquisition Paths
1. **Organic search** → blog post → web-demo CTA
2. **Teacher referral** → shared topic pack link → signup
3. **Challenges on social** (Leaderboard share link)

## 3. In-App Journey
```mermaid
graph TD
  A[Landing] --> B{Auth?}
  B -->|guest| C[Onboarding deck]
  B -->|logged| D[Deck Manager]
  D --> E[Coach / Drill] --> F[Leaderboard] ...
```

## 4. Drop-off Risks & Fix Ideas
| Step | Metric | Risk | Mitigation |
|------|--------|------|-----------|
| Landing → signup | bounce rate | Long hero copy | A/B shorter headline |
