# Sober-Body

[![Unit tests](https://github.com/llm-case-studies/Sober-Body/actions/workflows/ci.yml/badge.svg)](https://github.com/llm-case-studies/Sober-Body/actions/workflows/ci.yml)

Sober-Body™ is a real-time alcohol harm-reduction companion that helps users "party smart and wake up winning." It combines one-tap drink logging with BAC estimates and playful guidance.

## Getting Started

The workspace uses **pnpm**. From the repository root run:

```bash
pnpm install
```

Start both dev servers in a tmux split with:

```bash
./scripts/dev.sh
```

If tmux isn't available, open two terminals and run `pnpm dev:sb` and `pnpm dev:pc` manually.
Sober-Body opens at <http://localhost:5173> and PronunCo at <http://localhost:5174>. Microsoft Edge is recommended because other browsers have partial Web Speech API support.

Environment variables come from `.env.local` in the repo root:

```dotenv
VITE_TRANSLATOR_KEY=your-azure-key
VITE_TRANSLATOR_REGION=your-region
VITE_TRANSLATOR_ENDPOINT=https://<your-translator>.cognitiveservices.azure.com
```

Default flags: `VITE_DECK_V2=true` for PronunCo, `false` for Sober-Body.

### Common commands

- `pnpm dev:sb` – start Sober-Body
- `pnpm dev:pc` – start PronunCo
- `pnpm test:unit` – unit tests for both apps
- `pnpm lint` – lint the code
- `pnpm build --filter apps/sober-body` – example production build

## Testing

Run all unit tests:

```bash
pnpm test:unit
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
