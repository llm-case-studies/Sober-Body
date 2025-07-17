# Mobile UI Beta - Pronunco

## Overview

Pronunco now includes a comprehensive mobile-optimized user interface designed for smartphones and tablets. The mobile UI provides a touch-friendly experience with improved navigation and layouts optimized for small screens.

## ✨ Key Features

### 📱 **Responsive Design**
- Automatic detection of mobile devices (≤ 640px width)
- Touch-friendly buttons with minimum 44px tap targets
- Optimized typography and spacing for mobile reading

### 🏠 **Deck Manager Mobile**
- **Card-based layout**: Replaces desktop table with stacked cards
- **Large action buttons**: Full-width "Start Practice" buttons instead of tiny icons
- **Better navigation**: Cards navigate directly to mobile coach experience

### 🎤 **Coach/Drill Mobile**
- **Vertical layout**: Prompt panel on top (max 75vh), feedback panel below
- **Mobile-optimized controls**: Larger buttons and form elements
- **Better text areas**: Appropriate sizing for mobile input

### 🧙‍♂️ **Teacher Wizard Mobile**
- **Single-column layout**: Stacked instead of side-by-side grid
- **Improved buttons**: Larger tap targets for better usability
- **Smart navigation**: Routes to mobile deck manager when appropriate

### ⚙️ **Settings Mobile**
- **Responsive form elements**: Larger selectors and buttons
- **Improved spacing**: Better visual hierarchy on small screens
- **Touch-friendly controls**: All interactive elements optimized for touch

## 🚀 Usage

### Automatic Mobile Detection
The mobile UI activates automatically when:
- Device width is ≤ 640px (smartphones, small tablets)
- User enables `enableMobileBeta` flag in settings
- User navigates to `/m/*` URLs directly

### Manual Access
You can access mobile views directly:
- **Deck Manager**: `/pc/m/decks`
- **Coach/Practice**: `/pc/m/coach/:deckId`
- **Teacher Wizard**: `/pc/m/teacher-wizard`
- **Settings**: `/pc/m/settings`

### Enabling Mobile Beta
1. **Settings Toggle**: Enable the `enableMobileBeta` flag in the settings
2. **Direct URLs**: Navigate to URLs prefixed with `/m/`, for example: `/pc/m/decks`
3. **Device Detection**: Automatically activates on mobile devices

## 🔧 Technical Implementation

### Mobile Components
- `DeckListMobile.tsx` - Mobile deck card layout
- `CoachMobile.tsx` - Mobile coach with vertical stacking
- `TabBar.tsx` - Bottom navigation for mobile
- `MobileShell.tsx` - Mobile app container

### Mobile Navigation
- **Bottom tab bar** with Home, Wizard, and Settings
- **Mobile routes** with dedicated `/m/*` URL structure
- **Smart navigation** between mobile and desktop views

## 📱 Mobile Experience Improvements

### Before vs After
- **Deck Manager**: Table → Touch-friendly cards with large buttons
- **Coach**: Side-by-side → Vertical stacking for mobile screens
- **Wizard**: Two-column → Single-column with better touch targets
- **Settings**: Desktop form → Mobile-optimized controls

### Touch Targets
All interactive elements meet Apple/Google guidelines:
- Minimum 44px height for buttons
- Adequate spacing between tap targets
- Clear visual feedback for touch interactions

## Screenshots

Recent mobile UI screenshots available in `/docs/ui-screenshots/Deck-wizard/`:
- Mobile deck manager with card layout
- Mobile wizard with single-column design
- Mobile coach interface (vertical layout)

## Known Issues & Future Enhancements

### Current Status
- ✅ All core pages mobile-optimized
- ✅ Touch-friendly navigation
- ✅ Responsive breakpoints working
- 🔄 UI polish ongoing
- 🔄 Performance optimizations in progress

### Planned Improvements
- Progressive Web App (PWA) features
- Offline-first capabilities
- Advanced mobile gestures
- Push notifications for practice reminders

## Feedback

The mobile UI is actively being improved. Please test on actual mobile devices and report any usability issues or suggestions.
