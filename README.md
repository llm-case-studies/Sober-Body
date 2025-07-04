# Sober-Body

Sober-Body™ is a real-time alcohol harm-reduction companion that helps users "party smart and wake up winning." It combines one-tap drink logging with BAC estimates and playful guidance.

## Quick start

The project now uses a **pnpm workspace** with two packages under `apps/` and `packages/`.
The main PWA lives in [`apps/sober-body/`](apps/sober-body/):

```bash
pnpm install
pnpm --filter sober-body dev
# open http://localhost:5173/app
```

The Pronunciation Coach playground is in [`packages/pronunciation-coach/`](packages/pronunciation-coach/):

```bash
cd packages/pronunciation-coach
pnpm install
pnpm run dev
# open http://localhost:5174
```


Create a `.env.local` file at the repository root with your translation API
credentials. All workspaces load environment variables from that shared file:

```dotenv
VITE_TRANSLATOR_KEY=your-azure-key
VITE_TRANSLATOR_REGION=your-region
VITE_TRANSLATOR_ENDPOINT=https://<your-translator>.cognitiveservices.azure.com
```

## Testing

Run the unit tests for the PWA workspace:

```bash
pnpm --filter sober-body test
```

## Repository layout

- `apps/sober-body/` &mdash; main PWA codebase
- `packages/pronunciation-coach/` &mdash; standalone playground
- `docs/ARCHITECTURE.md` &mdash; developer architecture overview
- `docs/BACKLOG.md` &mdash; upcoming features and milestones
- `docs/sober-body/` &mdash; white-paper drafts and context
- `docs/pronunco/` &mdash; PronunCo white-papers
- `docs/HTMX_SETUP.md` &mdash; repo root instructions for htmx

## Whitepapers
- [Sober-Body Framework](docs/sober-body/sober_body_framework_top_level_whitepaper.md)
- [PronunCo White-Papers](docs/pronunco/00_index.md)

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for commit rules, PR workflow and testing requirements.

## License & contact

License information will be added in a future release. For questions, open an issue or refer to maintainer details in the white papers.

## Deck Manager

The Coach now includes a simple Deck Manager for creating, editing and sharing custom phrase decks.
![Deck Manager screenshot](docs/images/deck-manager.png)

Decks are organised by `cat:<topic>` tags. Filter chips appear automatically when at least one deck uses a category.

### Authoring decks

Paste a text list via **Import ⌘V** and each line becomes a phrase.
You can bulk-import a folder of JSON decks via **Import folder** (Chrome/Edge/Safari only).
