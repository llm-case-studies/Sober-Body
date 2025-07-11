import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, clearDecks as clearAllDecks } from "../db";
import {
  importDeckZip,
  importDeckFolder,
} from "../../../../packages/core-storage/src/import-decks";
import {
  saveLastDir,
  getLastDir,
  getRecentDeckDirs,
  saveRecentDeckDir,
} from "../../../../packages/core-storage/src/ui-store";
import { exportDeckZip } from "../exportDeckZip";

export default function DeckManager() {
  const zipRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const pickerOpen = useRef(false);
  const navigate = useNavigate();
  const decks = useLiveQuery(() => db().decks?.toArray() ?? [], [], []) || [];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recentDirs, setRecentDirs] = useState<Array<{name: string, handle: FileSystemDirectoryHandle, timestamp: number}>>([]);
  const [showRecentDirs, setShowRecentDirs] = useState(false);

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

  const handleZip = async (file: File) => {
    await importDeckZip(file, db());
  };

  const handleFolderFiles = async (files: FileList | File[]) => {
    await importDeckFolder(files, db());
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

  const supportsFSA = "showOpenFilePicker" in window;
  const supportsDir = "showDirectoryPicker" in window;

  const pickZip = async () => {
    if (supportsFSA) {
      try {
        const last = await getLastDir(db());
        console.log('ZIP import - last directory:', last);
        const [h] = await (window as any).showOpenFilePicker({
          multiple: false,
          types: [
            { description: "Zip", accept: { "application/zip": [".zip"] } },
          ],
          startIn: last,
        });
        const file = await h.getFile();
        
        // For ZIP files, we can't reliably get the parent directory
        // So we'll skip saving the directory for now and focus on folder imports
        console.log('ZIP file selected, not saving directory (use folder import for directory memory)');
        await handleZip(file);
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        /* fall back */
      }
    }
    zipRef.current?.click();
  };

  const pickRecentDir = async (recentDir: {name: string, handle: FileSystemDirectoryHandle, timestamp: number}) => {
    try {
      console.log('Using recent directory:', recentDir.name);
      const dir = recentDir.handle;
      
      // Check if we still have permission
      const permission = await dir.queryPermission({ mode: 'read' });
      if (permission !== 'granted') {
        const newPermission = await dir.requestPermission({ mode: 'read' });
        if (newPermission !== 'granted') {
          console.log('Permission denied for recent directory');
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
        console.log('Importing from recent directory:', dir.name);
        await saveRecentDeckDir(db(), dir);
        await handleFolderFiles(files);
        // Reload recent directories to update order
        const recent = await getRecentDeckDirs(db());
        setRecentDirs(recent);
      }
    } catch (e: any) {
      console.log('Failed to use recent directory:', e);
      // If the directory is no longer accessible, we could remove it from recents
    }
  };

  const pickJson = async () => {
    // Check if this is being called for folder import (from the button)
    console.log('pickJson called - checking path...');
    
    if (supportsDir) {
      console.log('Using directory picker for folder import');
      if (pickerOpen.current) return;
      pickerOpen.current = true;
      try {
        const last = await getLastDir(db());
        console.log('Folder import - last directory:', last);
        
        let startOptions: any = {};
        if (last) {
          // Check if the directory handle is still valid
          try {
            await last.queryPermission({ mode: 'read' });
            startOptions.startIn = last;
            console.log('Using saved directory as startIn:', last.name);
          } catch (e) {
            console.log('Saved directory is no longer accessible, using default');
            startOptions.startIn = "documents";
          }
        } else {
          startOptions.startIn = "documents";
        }
        
        const dir = await (window as any).showDirectoryPicker(startOptions);
        console.log('Selected directory:', dir);
        console.log('Directory name:', dir.name);
        console.log('Directory kind:', dir.kind);
        
        const fileHandles: any[] = [];
        for await (const h of dir.values()) {
          if (h.kind === "file" && h.name.endsWith(".json"))
            fileHandles.push(h);
        }
        const files = await Promise.all(fileHandles.map((h) => h.getFile()));
        if (files.length) {
          console.log('Saving folder directory:', dir);
          await saveLastDir(db(), dir as any);
          await handleFolderFiles(files);
          // Reload recent directories
          const recent = await getRecentDeckDirs(db());
          setRecentDirs(recent);
        }
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.log('Directory picker failed:', e);
        /* fall back */
      } finally {
        pickerOpen.current = false;
      }
    } else if (supportsFSA) {
      console.log('Using file picker for JSON import');
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
          console.log('JSON files selected, not saving directory');
          await handleFolderFiles(files);
        }
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        /* fall back */
      }
    } else {
      if (pickerOpen.current) return;
      pickerOpen.current = true;
      try {
        const last = await getLastDir(db());
        console.log('Folder import - last directory:', last);
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
          console.log('Saving folder directory:', dir);
          console.log('Directory name:', dir.name);
          console.log('Directory kind:', dir.kind);
          await saveLastDir(db(), dir as any);
          await handleFolderFiles(files);
          // Reload recent directories
          const recent = await getRecentDeckDirs(db());
          setRecentDirs(recent);
        }
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        /* fall back */
      } finally {
        pickerOpen.current = false;
      }
    }
    jsonRef.current?.click();
  };

  const clearDecks = async () => {
    await clearAllDecks();
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
    if (selectedIds.size === decks.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(decks.map((d) => d.id)));
  };

  const onDrill = () => {
    const id = [...selectedIds][0];
    if (id) navigate(`../coach/${id}`);
  };

  const onExport = async () => {
    await exportDeckZip([...selectedIds], db());
  };

  async function handleDelete() {
    await db().transaction("rw", db().decks, () =>
      db().decks.bulkDelete([...selectedIds]),
    );
    setSelectedIds(new Set());
  }

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-lg">Deck Manager (beta)</h2>
      <button className="border px-2" onClick={pickZip}>
        Import ZIP
      </button>
      <input
        data-testid="zipInput"
        id="zipInput"
        ref={zipRef}
        type="file"
        accept="application/zip"
        hidden
        onChange={onZipInput}
      />
      <div className="relative inline-block">
        <button 
          className="btn btn-outline-primary m-1" 
          onClick={pickJson}
        >
          Import folder
        </button>
        {recentDirs.length > 0 && (
          <>
            <button 
              className="btn btn-outline-secondary m-1 ml-0 px-2" 
              onClick={() => setShowRecentDirs(!showRecentDirs)}
              title="Recent deck folders"
            >
              ▼
            </button>
            {showRecentDirs && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-64">
                <div className="p-2 text-sm font-medium border-b bg-blue-50 text-blue-800">
                  📁 Recent Deck Folders:
                </div>
                {recentDirs.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No recent folders yet.
                    <br />
                    Import a folder to see it here.
                  </div>
                ) : (
                  recentDirs.map((dir, index) => {
                    const timeAgo = new Date(dir.timestamp).toLocaleDateString();
                    return (
                      <button
                        key={index}
                        className="block w-full text-left px-3 py-3 text-sm hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        onClick={() => {
                          pickRecentDir(dir);
                          setShowRecentDirs(false);
                        }}
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
      <input
        data-testid="jsonInput"
        id="jsonInput"
        ref={jsonRef}
        type="file"
        hidden
        webkitdirectory=""
        multiple
        onChange={onJsonInput}
      />
      <button className="border px-2" title="Clear decks" onClick={clearDecks}>
        Clear decks (beta)
      </button>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-8 text-center">
              <input
                type="checkbox"
                aria-label="Select All"
                checked={
                  selectedIds.size > 0 &&
                  decks.every((d) => selectedIds.has(d.id))
                }
                onChange={toggleAll}
              />
            </th>
            <th className="text-left">Title</th>
            <th className="text-left">Lang</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {decks.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="text-center">
                <input
                  type="checkbox"
                  aria-label={`Select deck ${d.title}`}
                  checked={selectedIds.has(d.id)}
                  onChange={() => toggleId(d.id)}
                />
              </td>
              <td>{d.title}</td>
              <td>{d.lang}</td>
              <td className="text-center">
                <Link to={`../coach/${d.id}`} aria-label="Play">▶</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedIds.size > 0 && (
        <div data-testid="action-bar" className="border p-2 space-x-2">
          <button onClick={onDrill}>▶ Drill</button>
          <button onClick={() => alert("TODO")}>📝 Edit Grammar</button>
          <button onClick={onExport}>📤 Export ZIP</button>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
}
