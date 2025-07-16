# Current Development Priorities

## Active Work Stream
**Status**: ✅ COMPLETED - Deck Enhancement Wizard
**Started**: 2025-07-16
**Completed**: 2025-07-16

## Shelved/Interrupted Work
- **Mobile UI refinements**: Two-column coach layout issues documented in PR
- **Device testing**: Mobile layouts on actual devices (low priority)

## Next Business PR - Desktop Improvements
**Context**: We were about to start working on desktop business functionality before VSCode crash and mobile UI diversion.

### Planned Desktop Improvements:

#### 1. **Deck Enhancement Wizard** 🔧
Add third mode to wizard: "Enhance Existing Deck"
- **Problem**: Early decks lack vocab and grammar sections
- **Solution**: AI-powered deck enrichment
- **Features**:
  - Load existing deck → Generate missing vocab/grammar
  - Create difficulty progression (Basic → Intermediate → Advanced)
  - Link related difficulty levels for easy navigation
  - Preserve original deck, create enhanced versions

#### 2. **Difficulty Progression System** 📈
- **Deck Families**: Group related decks by difficulty
- **Smart Navigation**: "Too hard? Try Basic" / "Too easy? Try Advanced"
- **Reference System**: Link between difficulty variants
- **UI Indicators**: Show progression path in deck manager

### ✅ Implementation Completed:
- ✅ Added third wizard mode: "🔧 Enhance Existing Deck"
- ✅ Smart deck dropdown with metadata indicators (📖V 📝G 💡B/I/A)
- ✅ Two-step enhancement flow: Deck preview → Enhancement selection
- ✅ Granular options: Vocabulary only, Grammar only, or both
- ✅ AI prompts for targeted content generation
- ✅ Preview screen shows current deck content and metadata
- ✅ Context-aware enhancement decisions

---

## Usage Notes
- Update this file when switching between work streams
- Document context before diving into urgent fixes
- Reference this file to resume interrupted work
- Keep "shelved" items for future pickup

*Last updated: 2025-07-16*