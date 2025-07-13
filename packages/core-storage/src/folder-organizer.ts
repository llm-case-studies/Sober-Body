import type { AppDB, Deck, Folder } from './db';

export interface AutoOrganizeConfig {
  byLanguage: boolean;
  byCategory: boolean;
  byDate: boolean; // month/week
  byTags: string[]; // specific tags to organize by
  dateGranularity: 'week' | 'month' | 'year';
}

export class FolderOrganizer {
  constructor(private db: AppDB) {}

  async createAutoFolders(config: AutoOrganizeConfig): Promise<void> {
    const decks = await this.db.decks.toArray();
    
    // Clear existing auto folders
    await this.db.folders.where('type').equals('auto').delete();

    if (config.byLanguage) {
      await this.createLanguageFolders(decks);
    }

    if (config.byCategory) {
      await this.createCategoryFolders(decks);
    }

    if (config.byDate) {
      await this.createDateFolders(decks, config.dateGranularity);
    }

    if (config.byTags.length > 0) {
      await this.createTagFolders(decks, config.byTags);
    }

    // Auto-assign decks to folders
    await this.autoAssignDecks();
  }

  private async createLanguageFolders(decks: Deck[]): Promise<void> {
    const languages = new Set(decks.map(d => d.lang));
    
    for (const lang of languages) {
      const languageName = this.getLanguageName(lang);
      await this.db.folders.add({
        id: `auto-lang-${lang}`,
        name: `🌍 ${languageName}`,
        type: 'auto',
        autoRule: { field: 'lang', value: lang },
        createdAt: Date.now()
      });
    }
  }

  private async createCategoryFolders(decks: Deck[]): Promise<void> {
    const categories = new Set(
      decks
        .map(d => d.category)
        .filter(Boolean)
    );

    for (const category of categories) {
      const categoryName = this.getCategoryDisplayName(category!);
      await this.db.folders.add({
        id: `auto-cat-${category}`,
        name: `📂 ${categoryName}`,
        type: 'auto',
        autoRule: { field: 'category', value: category },
        createdAt: Date.now()
      });
    }
  }

  private async createDateFolders(decks: Deck[], granularity: 'week' | 'month' | 'year'): Promise<void> {
    const dateGroups = new Map<string, Deck[]>();
    
    for (const deck of decks) {
      const date = new Date(deck.updatedAt);
      let key: string;
      
      switch (granularity) {
        case 'year':
          key = date.getFullYear().toString();
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
          break;
      }
      
      if (!dateGroups.has(key)) {
        dateGroups.set(key, []);
      }
      dateGroups.get(key)!.push(deck);
    }

    for (const [dateKey, deckGroup] of dateGroups) {
      if (deckGroup.length > 0) {
        const displayName = this.getDateDisplayName(dateKey, granularity);
        await this.db.folders.add({
          id: `auto-date-${dateKey}`,
          name: `📅 ${displayName}`,
          type: 'auto',
          autoRule: { field: 'date', pattern: dateKey },
          createdAt: Date.now()
        });
      }
    }
  }

  private async createTagFolders(decks: Deck[], targetTags: string[]): Promise<void> {
    for (const tag of targetTags) {
      const matchingDecks = decks.filter(d => 
        d.tags?.includes(tag) || 
        (Array.isArray(d.tags) && d.tags.includes(tag))
      );

      if (matchingDecks.length > 0) {
        await this.db.folders.add({
          id: `auto-tag-${tag}`,
          name: `🏷️ ${tag}`,
          type: 'auto',
          autoRule: { field: 'tags', value: tag },
          createdAt: Date.now()
        });
      }
    }
  }

  private async autoAssignDecks(): Promise<void> {
    const decks = await this.db.decks.toArray();
    const autoFolders = await this.db.folders.where('type').equals('auto').toArray();

    for (const deck of decks) {
      // Skip if manually assigned to custom folder
      if (deck.folderId?.startsWith('folder_')) continue;

      const matchingFolder = this.findMatchingAutoFolder(deck, autoFolders);
      if (matchingFolder) {
        await this.db.decks.update(deck.id, { folderId: matchingFolder.id });
      }
    }
  }

  private findMatchingAutoFolder(deck: Deck, autoFolders: Folder[]): Folder | null {
    for (const folder of autoFolders) {
      if (!folder.autoRule) continue;

      const { field, value, pattern } = folder.autoRule;

      switch (field) {
        case 'lang':
          if (deck.lang === value) return folder;
          break;
        case 'category':
          if (deck.category === value) return folder;
          break;
        case 'date':
          if (this.matchesDatePattern(deck.updatedAt, pattern!)) return folder;
          break;
        case 'tags':
          if (this.hasTag(deck, value!)) return folder;
          break;
      }
    }
    return null;
  }

  private matchesDatePattern(timestamp: number, pattern: string): boolean {
    const date = new Date(timestamp);
    
    if (pattern.includes('-W')) {
      // Week pattern
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
      return weekKey === pattern;
    } else if (pattern.includes('-')) {
      // Month pattern
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === pattern;
    } else {
      // Year pattern
      return date.getFullYear().toString() === pattern;
    }
  }

  private hasTag(deck: Deck, tag: string): boolean {
    if (!deck.tags) return false;
    if (typeof deck.tags === 'string') {
      return deck.tags.includes(tag);
    }
    if (Array.isArray(deck.tags)) {
      return deck.tags.includes(tag);
    }
    return false;
  }

  private getLanguageName(langCode: string): string {
    const languages: Record<string, string> = {
      'en-US': 'English (US)',
      'pt-BR': 'Portuguese (Brazil)',
      'es-ES': 'Spanish (Spain)',
      'fr-FR': 'French (France)',
      'de-DE': 'German (Germany)',
      'it-IT': 'Italian (Italy)',
      'ja-JP': 'Japanese (Japan)',
      'ko-KR': 'Korean (Korea)',
      'zh-CN': 'Chinese (Simplified)',
      'ru-RU': 'Russian (Russia)'
    };
    return languages[langCode] || langCode;
  }

  private getCategoryDisplayName(category: string): string {
    const categories: Record<string, string> = {
      'groceries': 'Shopping & Market',
      'restaurant': 'Dining & Food',
      'hotel': 'Accommodation',
      'taxi': 'Transportation',
      'smalltalk': 'Casual Conversation',
      'lesson': 'Educational Content',
      'grammar': 'Grammar Practice',
      'nouns-verbs': 'Nouns & Verbs',
      'prepositions': 'Prepositions'
    };
    return categories[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  private getDateDisplayName(dateKey: string, granularity: 'week' | 'month' | 'year'): string {
    switch (granularity) {
      case 'year':
        return dateKey;
      case 'month':
        const [year, month] = dateKey.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      case 'week':
        const [weekYear, weekNum] = dateKey.split('-W');
        return `Week ${weekNum}, ${weekYear}`;
      default:
        return dateKey;
    }
  }

  // Disk sync functionality
  async syncToDisk(basePath: string): Promise<void> {
    const folders = await this.db.folders.where('type').equals('custom').toArray();
    const decks = await this.db.decks.toArray();

    for (const folder of folders) {
      const folderPath = this.buildFolderPath(folder, folders, basePath);
      await this.ensureDirectoryExists(folderPath);
      
      // Update folder with disk path
      await this.db.folders.update(folder.id, { diskPath: folderPath });

      // Export decks in this folder
      const folderDecks = decks.filter(d => d.folderId === folder.id);
      for (const deck of folderDecks) {
        await this.exportDeckToDisk(deck, folderPath);
      }
    }
  }

  async importFromDisk(basePath: string): Promise<void> {
    // Scan directory structure and create corresponding folders
    const folderStructure = await this.scanDirectoryStructure(basePath);
    
    for (const folder of folderStructure) {
      await this.db.folders.add({
        id: `disk-${Date.now()}-${Math.random()}`,
        name: folder.name,
        parentId: folder.parentId,
        type: 'custom',
        diskPath: folder.path,
        createdAt: Date.now()
      });
    }
  }

  private buildFolderPath(folder: Folder, allFolders: Folder[], basePath: string): string {
    const pathParts = [folder.name];
    let current = folder;
    
    while (current.parentId) {
      const parent = allFolders.find(f => f.id === current.parentId);
      if (!parent) break;
      pathParts.unshift(parent.name);
      current = parent;
    }
    
    return `${basePath}/${pathParts.join('/')}`;
  }

  private async ensureDirectoryExists(path: string): Promise<void> {
    // Browser implementation would use File System Access API
    // Node.js implementation would use fs.mkdir
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      // Browser File System Access API implementation
      console.log('Would create directory:', path);
    }
  }

  private async exportDeckToDisk(deck: Deck, folderPath: string): Promise<void> {
    // Export deck as JSON file to disk
    const deckData = {
      id: deck.id,
      title: deck.title,
      lang: deck.lang,
      category: deck.category,
      tags: deck.tags,
      lines: await this.getDeckLines(deck.id),
      updatedAt: deck.updatedAt
    };

    const fileName = `${deck.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    const filePath = `${folderPath}/${fileName}`;
    
    console.log('Would export deck to:', filePath, deckData);
  }

  private async getDeckLines(deckId: string): Promise<string[]> {
    const cards = await this.db.cards.where('deckId').equals(deckId).toArray();
    return cards.map(card => card.text);
  }

  private async scanDirectoryStructure(basePath: string): Promise<Array<{name: string, path: string, parentId?: string}>> {
    // Implementation would scan directory structure
    // This is a placeholder that would use File System Access API or Node.js fs
    console.log('Would scan directory structure at:', basePath);
    return [];
  }
}

// Helper function to create default auto-organize config
export function createDefaultAutoConfig(): AutoOrganizeConfig {
  return {
    byLanguage: true,
    byCategory: true,
    byDate: false,
    byTags: ['author:Leise', 'official'],
    dateGranularity: 'month'
  };
}