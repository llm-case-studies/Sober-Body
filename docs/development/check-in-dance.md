# Check-in Dance 🕺 - Standard Development Workflow

## Overview
Our reliable process for committing code changes and creating pull requests through GitHub UI instead of CLI.

## The Dance Steps

### 1. **Commit & Push** 🎯
```bash
# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "feat(scope): description

- Key improvement 1
- Key improvement 2
- Key improvement 3

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote branch
git push origin <branch-name>
```

### 2. **GitHub UI PR Creation** 🌐
1. Go to **GitHub** → https://github.com/llm-case-studies/Sober-Body
2. Click **"Compare & pull request"** (appears automatically for pushed branches)
3. Use **structured PR description** (see template below)
4. Click **"Create pull request"**
5. **Review, approve, and merge** when ready

### 3. **PR Description Template** 📝
```markdown
## Summary
- ✅ Key feature/fix 1
- ✅ Key feature/fix 2  
- ✅ Key feature/fix 3

## Technical Improvements
- Technical detail 1
- Technical detail 2
- Technical detail 3

## Known Issues & Future Work
- **Issue 1**: Description and context
- **Issue 2**: Description and context

These remaining issues are documented for future development cycles.

## Testing
- ✅ All tests passing
- ✅ Feature X working
- ✅ Feature Y working
- 🔄 Feature Z (partial - documented as follow-up)
```

## Why This Works Better

### ✅ Advantages
- **Reliable**: GitHub UI is more stable than CLI tools
- **Visual**: Better diff review and conflict resolution
- **Collaborative**: Easy for team members to review
- **Flexible**: Can edit PR description after creation
- **Consistent**: Same workflow every time

### ❌ Avoid CLI PR Creation
- `gh pr create` often fails with permission/config issues
- Complex authentication requirements
- Less reliable than web UI
- Harder to format rich descriptions

## Usage Notes
- Always use this workflow for feature branches
- Keep commits clean and descriptive
- Document known issues honestly in PR descriptions
- Test thoroughly before push
- Use consistent commit message format

---

*This workflow ensures reliable code integration and clear communication about changes.*