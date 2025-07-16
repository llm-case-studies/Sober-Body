# Current Development Priorities

## Active Work Stream
**Status**: 🚀 IMPLEMENTING - Coach Desktop UI Enhancements
**Started**: 2025-07-16

## Shelved/Interrupted Work
- **Mobile UI refinements**: Two-column coach layout issues documented in PR
- **Device testing**: Mobile layouts on actual devices (low priority)

## Follow-up Ideas (Future Enhancements)

### **Deck Enhancement Wizard Polish** 🔧
1. **Add "New Folder" to folder selection**: Avoid multi-step route for new folder creation
2. **Sweet G-V indicators in Deck Manager**: Bring 📖V 📝G 💡B/I/A indicators to main deck list
3. **Tabbed layout for long drills**: Prevent tall forms with tabs (Content | Enhancement Options | Folder Selection)
4. **Group deck selection by folder**: Organize long dropdown lists by folders
5. **Add legend/hover info**: Explain what V/G/I indicators mean

*Captured: 2025-07-16 - User feedback after successful implementation*

### **Coach UI Polish** 🎤
1. ✅ **Remove redundant top tab bar**: Student pane tabs duplicate top navigation
2. ✅ **Drill-pattern vocabulary**: Show selected word above controls like drill items
3. ✅ **Record/score vocabulary**: Apply same pronunciation scoring to vocab words
4. ✅ **Unified interaction pattern**: Consistent UX across drill items and vocabulary
5. ✅ **Add G-V indicators to deck manager**: Display 📖V 📝G 💡B/I/A indicators in main deck list
6. ✅ **Add legend/hover info**: Tooltips explain what indicators mean

*Captured: 2025-07-16 - User feedback after tabbed interface implementation*

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

#### 2. **Coach Desktop UI Enhancements** 🎤
**Problem**: Students must navigate to top tabs to access vocab/grammar - unclear and disruptive to flow
**Solution**: Right-panel tabbed content with unified controls
- **3-Tabbed Right Panel**: Drill Items | Vocabulary | Grammar
- **Unified Controls**: Play/Record/Translate apply to active tab content
- **Better UX Flow**: Access vocabulary/grammar without leaving practice area
- **Clear Tab Purpose**: Obvious what each tab contains and does

#### 3. **Difficulty Progression System** 📈
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