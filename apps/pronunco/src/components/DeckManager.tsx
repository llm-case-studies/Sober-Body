import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import {
  importDeckFiles,
  saveDecks,
} from "../../../sober-body/src/features/games/deck-storage";
import { useDecks } from "../../../sober-body/src/features/games/deck-context";
import {
  saveLastDir,
  getLastDir,
  getRecentDeckDirs,
  saveRecentDeckDir,
} from "../../../../packages/core-storage/src/ui-store";
import NewDrillWizard from "./NewDrillWizard";
import FolderTree from "./FolderTree";
import NewFolderModal from "./NewFolderModal";
import DeckEditor from "./DeckEditor";
import { useSettings } from "../features/core/settings-context";
import type { Deck } from "../../../sober-body/src/features/games/deck-types";

const backgroundThemes = [
  'bg-gradient-to-br from-blue-100 via-indigo-100 to-cyan-100',
  'bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100',
  'bg-gradient-to-br from-amber-100 via-orange-100 to-red-100',
  'bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100',
  'bg-gradient-to-br from-purple-100 via-violet-100 to-pink-100'
];

export default function DeckManager() {
  const zipRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const singleJsonRef = useRef<HTMLInputElement>(null);
  const pickerOpen = useRef(false);
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { decks: soberBodyDecks } = useDecks();
  const decks = soberBodyDecks;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recentDirs, setRecentDirs] = useState<Array<{name: string, handle: FileSystemDirectoryHandle, timestamp: number}>>([]);
  const [showRecentDirs, setShowRecentDirs] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showDeckEditor, setShowDeckEditor] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [showMoveDropdown, setShowMoveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  const moveButtonRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const folders = useLiveQuery(() => db().folders?.toArray() ?? [], [], []) || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTheme(prev => (prev + 1) % backgroundThemes.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadRecentDirs = async () => {
      const recent = await getRecentDeckDirs(db());
      setRecentDirs(recent);
    };
    loadRecentDirs();
  }, []);

  useEffect(() => {
    setSelectedIds((prev) => {
      const keep = new Set<string>();
      for (const id of prev) if (decks.some((d) => d.id === id)) keep.add(id);
      return keep;
    });
  }, [decks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking on a move button
      if ((e.target as Element)?.closest('[data-move-button]')) return;
      setShowMoveDropdown(null);
      setDropdownPosition(null);
    };
    
    if (showMoveDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMoveDropdown]);

  const handleZip = async (file: File) => {
    // Extract zip and import individual files to SoberBody storage
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);
    const jsonFiles: File[] = [];
    
    await Promise.all(
      Object.entries(zip.files).map(async ([name, f]) => {
        if (name.startsWith('decks/') && name.endsWith('.json')) {
          const content = await f.async('string');
          const blob = new Blob([content], { type: 'application/json' });
          jsonFiles.push(new File([blob], name.replace('decks/', ''), { type: 'application/json' }));
        }
      })
    );
    
    if (jsonFiles.length > 0) {
      await importDeckFiles(jsonFiles);
    }
  };

  const handleFolderFiles = async (files: FileList | File[]) => {
    await importDeckFiles(files);
  };

  const handleJsonImport = async (files: FileList | File[]) => {
    await importDeckFiles(files);
  };

  const onZipInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleZip(e.target.files[0]);
    }
    e.target.value = "";
  };

  const onJsonInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      await handleFolderFiles(e.target.files);
    }
    e.target.value = "";
  };

  const onSingleJsonInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      await handleJsonImport(e.target.files);
    }
    e.target.value = "";
  };

  const supportsFSA = "showOpenFilePicker" in window;
  const supportsDir = "showDirectoryPicker" in window;

  const pickZip = async () => {
    if (supportsFSA) {
      try {
        const last = await getLastDir(db());
        const [h] = await (window as any).showOpenFilePicker({
          multiple: false,
          types: [
            { description: "Zip", accept: { "application/zip": [".zip"] } },
          ],
          startIn: last,
        });
        const file = await h.getFile();
        await handleZip(file);
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      }
    }
    zipRef.current?.click();
  };

  const pickRecentDir = async (recentDir: {name: string, handle: FileSystemDirectoryHandle, timestamp: number}) => {
    try {
      const dir = recentDir.handle;
      const permission = await dir.queryPermission({ mode: 'read' });
      if (permission !== 'granted') {
        const newPermission = await dir.requestPermission({ mode: 'read' });
        if (newPermission !== 'granted') {
          return;
        }
      }
      const fileHandles: any[] = [];
      for await (const h of dir.values()) {
        if (h.kind === "file" && h.name.endsWith(".json"))
          fileHandles.push(h);
      }
      const files = await Promise.all(fileHandles.map((h) => h.getFile()));
      if (files.length) {
        await saveRecentDeckDir(db(), dir);
        await handleFolderFiles(files);
        const recent = await getRecentDeckDirs(db());
        setRecentDirs(recent);
      }
    } catch (e: any) {
    }
  };

  const pickJson = async () => {
    if (supportsDir) {
      if (pickerOpen.current) return;
      pickerOpen.current = true;
      try {
        const last = await getLastDir(db());
        let startOptions: any = {};
        if (last) {
          try {
            await last.queryPermission({ mode: 'read' });
            startOptions.startIn = last;
          } catch (e) {
            startOptions.startIn = "documents";
          }
        } else {
          startOptions.startIn = "documents";
        }
        const dir = await (window as any).showDirectoryPicker(startOptions);
        const fileHandles: any[] = [];
        for await (const h of dir.values()) {
          if (h.kind === "file" && h.name.endsWith(".json"))
            fileHandles.push(h);
        }
        const files = await Promise.all(fileHandles.map((h) => h.getFile()));
        if (files.length) {
          await saveLastDir(db(), dir as any);
          await handleFolderFiles(files);
          const recent = await getRecentDeckDirs(db());
          setRecentDirs(recent);
        }
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      } finally {
        pickerOpen.current = false;
      }
    } else if (supportsFSA) {
      try {
        const last = await getLastDir(db());
        const handles = await (window as any).showOpenFilePicker({
          multiple: true,
          types: [
            { description: "JSON", accept: { "application/json": [".json"] } },
          ],
          startIn: last,
        });
        const files = await Promise.all(handles.map((h: any) => h.getFile()));
        if (files.length) {
          await handleFolderFiles(files);
        }
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      }
    } else {
      if (pickerOpen.current) return;
      pickerOpen.current = true;
      try {
        const last = await getLastDir(db());
        const dir = await (window as any).showDirectoryPicker({
          startIn: last ?? "documents",
        });
        const fileHandles: any[] = [];
        for await (const h of dir.values()) {
          if (h.kind === "file" && h.name.endsWith(".json"))
            fileHandles.push(h);
        }
        const files = await Promise.all(fileHandles.map((h) => h.getFile()));
        if (files.length) {
          await saveLastDir(db(), dir as any);
          await handleFolderFiles(files);
          const recent = await getRecentDeckDirs(db());
          setRecentDirs(recent);
        }
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      } finally {
        pickerOpen.current = false;
      }
    }
    jsonRef.current?.click();
  };

  const pickSingleJson = async () => {
    if (supportsFSA) {
      try {
        const last = await getLastDir(db());
        const handles = await (window as any).showOpenFilePicker({
          multiple: true,
          types: [
            { description: "JSON", accept: { "application/json": [".json"] } },
          ],
          startIn: last,
        });
        const files = await Promise.all(handles.map((h: any) => h.getFile()));
        if (files.length) {
          await handleJsonImport(files);
        }
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      }
    }
    singleJsonRef.current?.click();
  };

  const clearDecks = async () => {
    await saveDecks([]);
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const filtered = getFilteredDecks();
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((d) => d.id)));
  };

  const onDrill = () => {
    const id = [...selectedIds][0];
    if (id) navigate(`../coach/${id}`);
  };

  const onExportZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    selectedIds.forEach(id => {
      const deck = decks.find(d => d.id === id);
      if (deck) {
        zip.file(`decks/${id}.json`, JSON.stringify(deck, null, 2));
      }
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decks.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onExportJson = async () => {
    const selectedDecks = [...selectedIds].map(id => decks.find(d => d.id === id)).filter(Boolean);
    
    if (selectedDecks.length === 1) {
      // Single deck - export as individual JSON file
      const deck = selectedDecks[0];
      const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Multiple decks - export as array
      const blob = new Blob([JSON.stringify(selectedDecks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decks_${selectedDecks.length}_selected.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  async function handleDelete() {
    const updatedDecks = decks.filter(deck => !selectedIds.has(deck.id));
    await saveDecks(updatedDecks);
    setSelectedIds(new Set());
  }

  const getFilteredDecks = (): Deck[] => {
    if (selectedFolderId === null) {
      return decks; // Show all decks
    } else if (selectedFolderId === 'unorganized') {
      return decks.filter(deck => !deck.tags?.some(tag => tag.startsWith('folder:')));
    } else {
      return decks.filter(deck => deck.tags?.includes(`folder:${selectedFolderId}`));
    }
  };

  const moveDeckToFolder = async (deckId: string, folderId: string | null) => {
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        const tags = deck.tags?.filter(tag => !tag.startsWith('folder:')) || [];
        if (folderId) {
          tags.push(`folder:${folderId}`);
        }
        return { ...deck, tags, updated: Date.now() };
      }
      return deck;
    });
    await saveDecks(updatedDecks);
    setShowMoveDropdown(null);
  };

  const openDeckEditor = (deckId?: string) => {
    setEditingDeckId(deckId || null);
    setShowDeckEditor(true);
  };

  const closeDeckEditor = () => {
    setShowDeckEditor(false);
    setEditingDeckId(null);
  };

  const filteredDecks = getFilteredDecks();

  return (
    <div className={`min-h-screen py-8 transition-all duration-1000 ${backgroundThemes[currentTheme]}`}>
      <div className="max-w-7xl mx-auto px-[10%] sm:px-[10%] lg:px-[10%]">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-[80vh]">
            {/* Folder Tree Sidebar */}
            <FolderTree
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              onCreateFolder={() => setShowNewFolderModal(true)}
            />
            
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Deck Manager</h2>
          <div className="flex gap-4 mb-4">
            {settings.role === 'teacher' && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors" onClick={()=>setShowWizard(true)}>➕ New Drill</button>
            )}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" onClick={pickZip}>Import ZIP</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors" onClick={pickSingleJson}>Import JSON</button>
            <div className="relative inline-block">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" onClick={pickJson}>Import folder</button>
              {recentDirs.length > 0 && (
                <>
                  <button 
                    className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ml-1"
                    onClick={() => setShowRecentDirs(!showRecentDirs)} 
                    title="Recent deck folders"
                  >
                    ▼
                  </button>
                  {showRecentDirs && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-64">
                      <div className="p-2 text-sm font-medium border-b bg-blue-50 text-blue-800">📁 Recent Deck Folders:</div>
                      {recentDirs.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">No recent folders yet.<br />Import a folder to see it here.</div>
                      ) : (
                        recentDirs.map((dir, index) => {
                          const timeAgo = new Date(dir.timestamp).toLocaleDateString();
                          return (
                            <button
                              key={index}
                              className="block w-full text-left px-3 py-3 text-sm hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                              onClick={() => { pickRecentDir(dir); setShowRecentDirs(false); }}
                            >
                              <div className="font-medium text-gray-800">{dir.name}</div>
                              <div className="text-xs text-gray-500 mt-1">Last used: {timeAgo}</div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors" onClick={clearDecks}>Clear decks</button>
          </div>
          <div className="space-y-2">
            {filteredDecks.map((d) => (
              <div key={d.id} className="flex items-center gap-4 p-2 border-t">
                <input type="checkbox" aria-label={`Select deck ${d.title}`} checked={selectedIds.has(d.id)} onChange={() => toggleId(d.id)} />
                <div className="flex-1">
                  <div className="font-bold">{d.title}</div>
                  <div className="text-sm text-gray-500">{d.lang}</div>
                </div>
                
                {/* Move to Folder Dropdown */}
                <div className="relative">
                  <button
                    ref={(el) => {moveButtonRefs.current[d.id] = el;}}
                    data-move-button
                    onClick={() => {
                      const newValue = showMoveDropdown === d.id ? null : d.id;
                      
                      if (newValue && moveButtonRefs.current[d.id]) {
                        const rect = moveButtonRefs.current[d.id]!.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.right - 200 + window.scrollX // 200px is dropdown width
                        });
                      } else {
                        setDropdownPosition(null);
                      }
                      
                      setShowMoveDropdown(newValue);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors"
                  >
                    📁 Move
                  </button>
                </div>
                
                <Link to={`../coach/${d.id}`} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors">▶ Play</Link>
              </div>
            ))}
          </div>
          {selectedIds.size > 0 && (
            <div className="border-t p-2 space-x-2 mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" onClick={onDrill}>▶ Drill</button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" onClick={() => openDeckEditor([...selectedIds][0])}>✏️ Edit Deck</button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors" onClick={onExportJson}>📄 Export JSON</button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-colors" onClick={onExportZip}>📤 Export ZIP</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors" onClick={handleDelete}>🗑 Delete</button>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
      
      <input ref={zipRef} type="file" accept="application/zip" hidden onChange={onZipInput} />
      <input ref={jsonRef} type="file" hidden webkitdirectory="" multiple onChange={onJsonInput} />
      <input ref={singleJsonRef} type="file" accept="application/json" multiple hidden onChange={onSingleJsonInput} />
      
      <NewDrillWizard open={showWizard} onClose={() => setShowWizard(false)} />
      <NewFolderModal 
        open={showNewFolderModal} 
        onClose={() => setShowNewFolderModal(false)} 
      />
      <DeckEditor 
        open={showDeckEditor} 
        onClose={closeDeckEditor}
        deckId={editingDeckId} 
      />
      
      {/* Move Dropdown Portal */}
      {showMoveDropdown && dropdownPosition && createPortal(
        <div 
          className="fixed bg-white border-2 border-blue-500 rounded shadow-lg z-[9999] min-w-48 max-h-64 overflow-y-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            backgroundColor: '#ffffff'
          }}
        >
          <button
            onClick={() => moveDeckToFolder(showMoveDropdown, null)}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          >
            📂 Unorganized
          </button>
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => moveDeckToFolder(showMoveDropdown, folder.id)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
            >
              📁 {folder.name}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}