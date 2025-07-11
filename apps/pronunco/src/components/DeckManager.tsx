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
  const pickerOpen = useRef(false);
  const navigate = useNavigate();
  const decks = useLiveQuery(() => db().decks?.toArray() ?? [], [], []) || [];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recentDirs, setRecentDirs] = useState<Array<{name: string, handle: FileSystemDirectoryHandle, timestamp: number}>>([]);
  const [showRecentDirs, setShowRecentDirs] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);

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
    <div className={`min-h-screen py-8 transition-all duration-1000 ${backgroundThemes[currentTheme]}`}>
      <div className="max-w-7xl mx-auto px-[10%] sm:px-[10%] lg:px-[10%]">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4">Deck Manager</h2>
          <div className="flex gap-4 mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" onClick={pickZip}>Import ZIP</button>
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
            {decks.map((d) => (
              <div key={d.id} className="flex items-center gap-4 p-2 border-t">
                <input type="checkbox" aria-label={`Select deck ${d.title}`} checked={selectedIds.has(d.id)} onChange={() => toggleId(d.id)} />
                <div className="flex-1">
                  <div className="font-bold">{d.title}</div>
                  <div className="text-sm text-gray-500">{d.lang}</div>
                </div>
                <Link to={`../coach/${d.id}`} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors">▶ Play</Link>
              </div>
            ))}
          </div>
          {selectedIds.size > 0 && (
            <div className="border-t p-2 space-x-2 mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" onClick={onDrill}>▶ Drill</button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" onClick={() => alert("TODO")}>📝 Edit Grammar</button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors" onClick={onExport}>📤 Export ZIP</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors" onClick={handleDelete}>🗑 Delete</button>
            </div>
          )}
        </div>
      </div>
      <input ref={zipRef} type="file" accept="application/zip" hidden onChange={onZipInput} />
      <input ref={jsonRef} type="file" hidden webkitdirectory="" multiple onChange={onJsonInput} />
    </div>
  );
}