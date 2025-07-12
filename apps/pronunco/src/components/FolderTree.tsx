import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Folder, Deck } from '../../../../packages/core-storage/src/db';

interface FolderTreeProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolder: () => void;
}

interface FolderWithCounts extends Folder {
  deckCount: number;
  children: FolderWithCounts[];
}

export default function FolderTree({ selectedFolderId, onFolderSelect, onCreateFolder }: FolderTreeProps) {
  const folders = useLiveQuery(() => db().folders?.toArray() ?? [], [], []) || [];
  const decks = useLiveQuery(() => db().decks?.toArray() ?? [], [], []) || [];
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  // Build folder tree with deck counts
  const buildFolderTree = (): FolderWithCounts[] => {
    const folderMap = new Map<string, FolderWithCounts>();
    
    // Initialize all folders
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        deckCount: 0,
        children: []
      });
    });

    // Count decks in each folder
    decks.forEach(deck => {
      if (deck.folderId && folderMap.has(deck.folderId)) {
        folderMap.get(deck.folderId)!.deckCount++;
      }
    });

    // Build tree structure
    const rootFolders: FolderWithCounts[] = [];
    
    folders.forEach(folder => {
      const folderNode = folderMap.get(folder.id)!;
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)!.children.push(folderNode);
      } else {
        rootFolders.push(folderNode);
      }
    });

    return rootFolders.sort((a, b) => a.name.localeCompare(b.name));
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolder = (folder: FolderWithCounts, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const paddingLeft = `${level * 20 + 12}px`;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700'
          }`}
          style={{ paddingLeft }}
          onClick={() => onFolderSelect(folder.id)}
        >
          {folder.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="mr-2 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <span className="mr-2">📁</span>
          <span className="flex-1">{folder.name}</span>
          <span className="text-sm text-gray-500">({folder.deckCount})</span>
        </div>
        {isExpanded && folder.children.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  const folderTree = buildFolderTree();
  const unorganizedDecks = decks.filter(deck => !deck.folderId);
  const totalDecks = decks.length;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Deck Organization</h3>
        <button
          onClick={onCreateFolder}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
        >
          + New Folder
        </button>
      </div>

      <div className="overflow-y-auto h-full">
        {/* All Decks */}
        <div
          className={`flex items-center py-3 px-3 cursor-pointer hover:bg-gray-100 ${
            selectedFolderId === null ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700'
          }`}
          onClick={() => onFolderSelect(null)}
        >
          <span className="mr-2">📚</span>
          <span className="flex-1">All Decks</span>
          <span className="text-sm text-gray-500">({totalDecks})</span>
        </div>

        {/* Folder Tree */}
        {folderTree.map(folder => renderFolder(folder))}

        {/* Unorganized Decks */}
        {unorganizedDecks.length > 0 && (
          <div
            className={`flex items-center py-3 px-3 cursor-pointer hover:bg-gray-100 ${
              selectedFolderId === 'unorganized' ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700'
            }`}
            onClick={() => onFolderSelect('unorganized')}
          >
            <span className="mr-2">📂</span>
            <span className="flex-1">Unorganized</span>
            <span className="text-sm text-gray-500">({unorganizedDecks.length})</span>
          </div>
        )}
      </div>
    </div>
  );
}