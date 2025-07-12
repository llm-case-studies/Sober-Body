# 🤖 AI Collaboration Guide (PronunCo & Sober-Body)

## 1. Branch scopes
| Assistant | Prefix example |
|-----------|----------------|
| **Claude** | `claude/*` |
| **Gemini** | `gemini/*` |
| **GPT-Assist** | `gpt/*` |
| **Codex** (infra/git) | `codex/*` |

## 2. Editing docs
* **Business & marketing chats** → edit `BUSINESS-STRATEGIC.md`.
* **Dev-tech chats** → edit `WORK-TECH-FEATURE.md`.

### How to propose a change
1. Open a PR editing the markdown file.  
2. Use GitHub’s “Add suggestion” for line-level tweaks.  
3. Codex applies suggestions and merges once CI is green (docs only).

## 3. Branch & PR etiquette
- Keep one logical change per PR.  
- Add `[skip ci]` to commit message if docs-only.  
- Tag the relevant assistants in the PR body (`@claude-bot`, `@gemini-bot`…).

