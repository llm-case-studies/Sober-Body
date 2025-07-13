# UX – User Journey & Personas (Living Doc)

## 🌟 Personas (topic-island model)

| Persona | Context “Island” | Pain Today | Win with PronunCo |
|---------|------------------|------------|-------------------|
| **Anna – Biz Traveler** | Airport → Taxi → Hotel | Crams phrasebook on plane; zero speaking practice | 15-min plane-mode drills + Azure heat-map assure intelligibility |
| **Mia – Student-Athlete** | Press interviews at world events | Tutor sessions cancelled during travel | Sport-press deck + leaderboard with teammates |
| **Grace – Relief Volunteer** | Disaster-relief greetings & supply requests | Offline PDFs only; shaky pronunciation | Offline PWA + badge shows 90 % intelligibility |
| **Carlos – Ops Manager** | Staff rotations abroad | LMS too generic; no visibility | Private company deck + progress dashboard |
| **Coach Kim – National Team Coach** | Athletes in Olympic village | Union rules—no extra staff time | Plug-and-play topic deck; leaderboard gamifies |
| **Dr. Patel – Clinic Director** | Rural clinic rotations | Patients struggle with English | Medical vocab pack + on-prem leaderboard |

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

## 🚀 Growth Experiments (rolling backlog)

| ID | Channel | Hook | KPI |
|----|---------|------|-----|
| **TikTok-Stitch-01** | TikTok stitch challenge | “Beat my 92 % Taxi Spanish score!” (heat-map video) | # of stitches, click-thru to `/challenge/taxi-es` |
| **IG-Story-Airport** | Instagram Story + Link sticker | 15-sec reel: user says “¿Dónde está mi equipaje?” → green heat-map | Swipe-ups to `/demo?deck=airport-mini` |
| **FB-Nomad-Pack** | Post in Digital-Nomad FB groups | Free mini Spanish airport deck ZIP | ZIP downloads |
| **WeeklyLeaderboardTweet** | Twitter bot | Auto-tweet top-3 scores every Monday | Impressions, clicks |
| **SlackSlashCommand-PoC** | Slack integration | `/drill luggage-es` inside corp Slack | Slash-command usage / day |
