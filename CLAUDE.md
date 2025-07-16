# Claude Development Guide

## Check-in Dance 🕺 - Standard Workflow

**ALWAYS use this workflow for commits and PRs:**

### 1. Commit & Push
```bash
git add -A
git commit -m "feat(scope): description

- Key improvement 1
- Key improvement 2

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin <branch-name>
```

### 2. GitHub UI PR Creation
1. Go to GitHub → https://github.com/llm-case-studies/Sober-Body
2. Click "Compare & pull request" 
3. Use structured PR description (see docs/development/check-in-dance.md)
4. Click "Create pull request"
5. User will review and merge

### 3. NEVER use `gh pr create` - it's unreliable

## Development Notes
- Always test before pushing
- Document known issues in PR descriptions
- Use TodoWrite tool for task tracking
- Keep commits clean and descriptive

## Context Persistence
- **Current work**: Check `docs/development/current-priorities.md`
- **When interrupted**: Update priorities doc with current context
- **Before new work**: Review priorities doc to resume properly

Full workflow details: `docs/development/check-in-dance.md`