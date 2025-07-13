# PronunCo Folder Organization System

## Overview

PronunCo supports a flexible folder organization system that allows both automatic and manual organization of pronunciation drill decks. This system addresses the needs of teachers managing dozens or hundreds of decks while supporting seamless migration between devices.

## Folder Types

### 🎯 Custom Folders (Manual)
- **User-created folders** like "Coach Leise", "Advanced Students", "Exam Prep"
- **Hierarchical structure** with parent-child relationships
- **Manual deck assignment** via drag-drop or move buttons
- **Disk sync capability** for device migration
- **Color coding** and custom ordering

### 🤖 Auto Folders (Automatic)
- **Language-based**: `🌍 Portuguese (Brazil)`, `🌍 English (US)`
- **Category-based**: `📂 Shopping & Market`, `📂 Dining & Food`
- **Date-based**: `📅 December 2024`, `📅 Week 50, 2024`
- **Tag-based**: `🏷️ official`, `🏷️ author:Leise`

## Database Schema

### Enhanced Folder Interface
```typescript
interface Folder {
  id: string
  name: string
  parentId?: string
  createdAt: number
  type: 'custom' | 'auto'
  autoRule?: {
    field: 'lang' | 'category' | 'date' | 'tags'
    value?: string
    pattern?: string
  }
  diskPath?: string // For sync with file system
  color?: string // Visual organization
  order?: number // Manual ordering
}
```

### Deck Schema (Enhanced)
```typescript
interface Deck {
  id: string
  title: string
  lang: string // BCP-47 language code
  category?: string // Extracted from tags with "cat:" prefix
  folderId?: string // Reference to folder
  tags?: string // Comma-separated or array
  updatedAt: number
}
```

## Auto-Organization Rules

### Language Folders
- **Trigger**: Every unique `deck.lang` value
- **Naming**: Maps BCP-47 codes to friendly names
  - `en-US` → `🌍 English (US)`
  - `pt-BR` → `🌍 Portuguese (Brazil)`
  - `es-ES` → `🌍 Spanish (Spain)`

### Category Folders
- **Trigger**: Every unique `deck.category` value
- **Source**: Extracted from tags with `cat:` prefix
- **Examples**:
  - `cat:groceries` → `📂 Shopping & Market`
  - `cat:restaurant` → `📂 Dining & Food`
  - `cat:hotel` → `📂 Accommodation`

### Date Folders
- **Granularity**: Week, Month, or Year
- **Source**: `deck.updatedAt` timestamp
- **Examples**:
  - Month: `📅 Dec 2024`
  - Week: `📅 Week 50, 2024`
  - Year: `📅 2024`

### Tag Folders
- **Configurable**: Specify which tags to create folders for
- **Examples**:
  - `official` → `🏷️ official`
  - `author:Leise` → `🏷️ author:Leise`

## Disk Sync System

### Export to Disk
Custom folders can be synced to the file system, creating a directory structure that mirrors the app organization:

```
/PronunCo-Decks/
├── Coach-Leise/
│   ├── Advanced-Portuguese/
│   │   ├── apresentacao-pessoal.json
│   │   └── substantivos-verbos.json
│   └── Beginner-Exercises/
│       ├── um-dia-normal.json
│       └── preposicoes-comuns.json
└── Exam-Preparation/
    ├── grammar-drills.json
    └── conversation-practice.json
```

### Import from Disk
When migrating to a new device, users can:
1. **Select a directory** containing organized deck files
2. **Auto-detect structure** - folders become custom folders
3. **Import decks** while preserving organization
4. **Maintain hierarchy** - nested folders create parent-child relationships

## Usage Examples

### Teacher Scenarios

#### 1. Personal Organization ("Coach Leise")
```typescript
// Create custom folder
await db.folders.add({
  id: 'folder_coach_leise',
  name: 'Coach Leise',
  type: 'custom',
  createdAt: Date.now()
});

// Move decks manually
await db.decks.update('deck-1', { folderId: 'folder_coach_leise' });
```

#### 2. Student-Based Organization
```typescript
// Hierarchical structure
const studentsFolder = await db.folders.add({
  name: 'My Students',
  type: 'custom'
});

const beginnerFolder = await db.folders.add({
  name: 'Beginner Group',
  type: 'custom',
  parentId: studentsFolder.id
});
```

#### 3. Auto-Organization by Language
```typescript
import { FolderOrganizer } from './folder-organizer';

const organizer = new FolderOrganizer(db);
await organizer.createAutoFolders({
  byLanguage: true,
  byCategory: true,
  byDate: false,
  byTags: ['official', 'author:Leise'],
  dateGranularity: 'month'
});
```

### Device Migration

#### Export Process
```typescript
// Sync custom folders to disk
await organizer.syncToDisk('/Users/teacher/PronunCo-Export');

// Results in organized directory structure
// Each deck exported as JSON file
// Folder hierarchy preserved
```

#### Import Process
```typescript
// Import from organized directory
await organizer.importFromDisk('/Users/teacher/PronunCo-Import');

// Creates corresponding app folders
// Imports all deck files
// Rebuilds folder hierarchy
```

## Implementation Status

### ✅ Completed (Sprint 4)
- [x] Enhanced folder database schema
- [x] Basic folder creation and deck assignment
- [x] Move dropdown with portal rendering
- [x] Smart folder name suggestions
- [x] FolderOrganizer service architecture

### 🚧 In Progress
- [ ] Auto-arrange UI controls
- [ ] Disk sync implementation (File System Access API)
- [ ] Import from disk structure
- [ ] Folder color coding and ordering

### 📋 Planned (Future Sprints)
- [ ] Drag-and-drop folder reordering
- [ ] Bulk deck operations
- [ ] Folder templates and presets
- [ ] Cloud sync integration

## Technical Architecture

### Core Components

1. **FolderOrganizer** (`packages/core-storage/src/folder-organizer.ts`)
   - Auto-folder creation and management
   - Disk sync operations
   - Import/export logic

2. **Enhanced Database Schema** (`packages/core-storage/src/db.ts`)
   - Extended Folder interface
   - Auto-rule support
   - Disk path tracking

3. **UI Components**
   - `FolderTree` - Sidebar navigation
   - `NewFolderModal` - Folder creation
   - `DeckManager` - Move operations

### Browser APIs Used
- **File System Access API** - For disk sync operations
- **IndexedDB** - Local storage via Dexie
- **React Portals** - Dropdown rendering outside containers

## Configuration Options

### Auto-Organization Config
```typescript
interface AutoOrganizeConfig {
  byLanguage: boolean;
  byCategory: boolean;
  byDate: boolean;
  byTags: string[];
  dateGranularity: 'week' | 'month' | 'year';
}
```

### Default Settings
```typescript
const defaultConfig = {
  byLanguage: true,        // Create language folders
  byCategory: true,        // Create category folders
  byDate: false,          // Skip date folders by default
  byTags: ['official'],   // Only create folders for official content
  dateGranularity: 'month' // Monthly grouping when enabled
};
```

## Best Practices

### For Teachers
1. **Start with auto-organize** to get basic structure
2. **Create custom folders** for specific needs (students, courses)
3. **Use disk sync** before device changes
4. **Regular exports** for backup purposes

### For Developers
1. **Always check folder type** before operations
2. **Preserve auto-rules** when updating auto folders
3. **Handle disk path conflicts** during sync
4. **Validate folder hierarchy** to prevent cycles

## Migration Guide

### From Flat Organization
1. Enable auto-organization for immediate structure
2. Gradually create custom folders for specific needs
3. Move important decks to custom folders
4. Export organized structure for backup

### Between Devices
1. Export from source device using disk sync
2. Copy organized directory to target device
3. Import using folder structure detection
4. Verify hierarchy and deck assignments

This folder organization system provides the flexibility needed for both casual users and professional teachers while maintaining the simplicity that makes PronunCo accessible to all users.