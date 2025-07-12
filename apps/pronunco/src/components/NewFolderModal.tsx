import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Deck } from '../../../../packages/core-storage/src/db';

interface NewFolderModalProps {
  open: boolean;
  onClose: () => void;
  parentId?: string;
}

export default function NewFolderModal({ open, onClose, parentId }: NewFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const decks = useLiveQuery(() => db().decks?.toArray() ?? [], [], []) || [];

  useEffect(() => {
    if (open) {
      generateSuggestions();
    }
  }, [open, decks]);

  const generateSuggestions = () => {
    // Analyze deck categories and tags to suggest folder names
    const categoryMap = new Map<string, number>();
    const tagMap = new Map<string, number>();

    decks.forEach(deck => {
      // Count categories
      if (deck.category) {
        categoryMap.set(deck.category, (categoryMap.get(deck.category) || 0) + 1);
      }

      // Count tags (if they exist and are comma-separated)
      if (deck.tags) {
        const tags = deck.tags.split(',').map(tag => tag.trim().toLowerCase());
        tags.forEach(tag => {
          if (tag) {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          }
        });
      }
    });

    // Generate suggestions based on most common categories/tags
    const suggestions: string[] = [];
    
    // Popular categories
    const sortedCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    sortedCategories.forEach(([category, count]) => {
      if (count >= 3) { // Only suggest if there are 3+ decks
        suggestions.push(category);
      }
    });

    // Popular tags with enhanced names
    const sortedTags = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    sortedTags.forEach(([tag, count]) => {
      if (count >= 2) { // Only suggest if there are 2+ decks
        // Enhance tag names
        const enhanced = enhanceTagName(tag);
        if (!suggestions.includes(enhanced)) {
          suggestions.push(enhanced);
        }
      }
    });

    // Add some general suggestions if not many specific ones
    if (suggestions.length < 3) {
      const generalSuggestions = [
        'Grammar & Syntax',
        'Vocabulary Building',
        'Conversation Practice',
        'Business Language',
        'Travel & Tourism',
        'Daily Life'
      ];
      
      generalSuggestions.forEach(suggestion => {
        if (!suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      });
    }

    setSuggestions(suggestions.slice(0, 6));
  };

  const enhanceTagName = (tag: string): string => {
    const enhancements: Record<string, string> = {
      'food': 'Food & Dining',
      'travel': 'Travel & Transportation', 
      'business': 'Business & Professional',
      'grammar': 'Grammar & Syntax',
      'conversation': 'Conversation Practice',
      'vocabulary': 'Vocabulary Building',
      'hotel': 'Hospitality & Hotels',
      'airport': 'Travel & Transportation',
      'restaurant': 'Food & Dining',
      'shopping': 'Shopping & Retail',
      'medical': 'Healthcare & Medical',
      'education': 'Education & Learning'
    };

    const enhanced = enhancements[tag.toLowerCase()];
    if (enhanced) return enhanced;

    // Capitalize first letter of each word
    return tag.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCreate = async () => {
    if (!folderName.trim()) return;

    const folder = {
      id: `folder_${Date.now()}`,
      name: folderName.trim(),
      parentId,
      createdAt: Date.now()
    };

    await db().folders.add(folder);
    setFolderName('');
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFolderName(suggestion);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Folder Name
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter folder name..."
            autoFocus
          />
        </div>

        {suggestions.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggested Names
              <span className="text-xs text-gray-500 ml-1">(based on your decks)</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  📁 {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!folderName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
}