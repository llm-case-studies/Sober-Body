# Sober-Body

[![Unit tests](https://github.com/llm-case-studies/Sober-Body/actions/workflows/ci.yml/badge.svg)](https://github.com/llm-case-studies/Sober-Body/actions/workflows/ci.yml)

Sober-Body™ is a real-time alcohol harm-reduction companion that helps users "party smart and wake up winning." It combines one-tap drink logging with BAC estimates and playful guidance.

## Getting Started

The workspace uses **pnpm**. From the repository root run:

```bash
pnpm install
```

Start the dev servers with:

```bash
./scripts/dev.sh [--pull] [--test] [--install]
```

The script checks for `tmux` and falls back to a single-terminal mode when it's
not installed. Use `--pull` to pull the latest changes (local modifications are
stashed and restored automatically), `--install` to run `pnpm install` before
starting and `--test` to run unit tests. Before launching the dev servers it
automatically frees ports 5173 and 5174, killing any leftover processes (using
`sudo` if necessary) and printing which ports were freed. Once the servers are running it lists
which ports are still in use. The URLs open automatically in Microsoft Edge at
<http://localhost:5173> (Sober-Body) and <http://localhost:5174/pc/decks>
(PronunCo). Other browsers have partial Web Speech API support, so Edge is
launched explicitly.

Environment variables come from `.env.local` in the repo root:

```dotenv
VITE_TRANSLATOR_KEY=your-azure-key
VITE_TRANSLATOR_REGION=your-region
VITE_TRANSLATOR_ENDPOINT=https://<your-translator>.cognitiveservices.azure.com
```


### Common commands

- `pnpm dev:sb` – start Sober-Body
- `pnpm dev:pc` – start PronunCo at `/pc`
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
- `docs/` &mdash; organized documentation (see [docs/INDEX.md](docs/INDEX.md) for full navigation)
  - `00_overview/` &mdash; architecture, contributing, roadmap
  - `10_pronunco/` &mdash; PronunCo features, whitepapers, mobile guide
  - `20_sober-body/` &mdash; Sober-Body whitepapers and features
  - `30_shared/` &mdash; cross-product features and ideas
  - `80_archive/` &mdash; historical documents
  - `90_sprints/` &mdash; sprint documentation

## Whitepapers

- [Sober-Body Framework](docs/20_sober-body/whitepapers/sober_body_framework_top_level_whitepaper.md)
- [PronunCo White-Papers](docs/pronunco/00_index.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit rules, PR workflow and testing requirements.

## License & contact

License information will be added in a future release. For questions, open an issue or refer to maintainer details in the white papers.

## Deck Manager

The Coach now includes a simple Deck Manager for creating, editing and sharing custom phrase decks.
![Deck Manager screenshot](docs/99_assets/images/deck-manager.png)

Decks are organised by `cat:<topic>` tags. Filter chips appear automatically when at least one deck uses a category.

### Authoring decks

Paste a text list via **Import ⌘V** and each line becomes a phrase.
You can bulk-import a folder of JSON decks via **Import folder** (Chrome/Edge/Safari only).
