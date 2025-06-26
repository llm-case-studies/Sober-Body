# Sober-Body

Sober-Body™ is a real-time alcohol harm-reduction companion that helps users "party smart and wake up winning." It combines one-tap drink logging with BAC estimates and playful guidance.

## Quick start

The project now uses a **pnpm workspace** with two packages under `apps/` and `packages/`.
The main PWA lives in [`apps/sober-body/`](apps/sober-body/):

```bash
cd apps/sober-body
pnpm install
pnpm run dev
# open http://localhost:5173/app
```

The Pronunciation Coach playground is in [`packages/pronunciation-coach/`](packages/pronunciation-coach/):

```bash
cd packages/pronunciation-coach
pnpm install
pnpm run dev
# open http://localhost:5174
```

## Repository layout

- `apps/sober-body/` &mdash; main PWA codebase
- `packages/pronunciation-coach/` &mdash; standalone playground
- `docs/ARCHITECTURE.md` &mdash; developer architecture overview
- `docs/BACKLOG.md` &mdash; upcoming features and milestones
- `docs/whitepapers/` &mdash; white-paper drafts and context
- `docs/HTMX_SETUP.md` &mdash; repo root instructions for htmx

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for commit rules, PR workflow and testing requirements.

## License & contact

License information will be added in a future release. For questions, open an issue or refer to maintainer details in the white papers.
