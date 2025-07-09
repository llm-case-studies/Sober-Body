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
} from "../../../../packages/core-storage/src/ui-store";
import { exportDeckZip } from "../exportDeckZip";

export default function DeckManager() {
  const zipRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const pickerOpen = useRef(false);
  const navigate = useNavigate();
  const decks = useLiveQuery(() => db.decks?.toArray() ?? [], [], []) || [];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds((prev) => {
      const keep = new Set<string>();
      for (const id of prev) if (decks.some((d) => d.id === id)) keep.add(id);
      return keep;
    });
  }, [decks]);

  const handleZip = async (file: File) => {
    await importDeckZip(file, db);
  };

  const handleFolderFiles = async (files: FileList | File[]) => {
    await importDeckFolder(files, db);
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
        const last = await getLastDir(db);
        const [h] = await (window as any).showOpenFilePicker({
          multiple: false,
          types: [
            { description: "Zip", accept: { "application/zip": [".zip"] } },
          ],
          startIn: last,
        });
        const file = await h.getFile();
        await saveLastDir(db, h as any);
        await handleZip(file);
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        /* fall back */
      }
    }
    zipRef.current?.click();
  };

  const pickJson = async () => {
    if (supportsFSA) {
      try {
        const last = await getLastDir(db);
        const handles = await (window as any).showOpenFilePicker({
          multiple: true,
          types: [
            { description: "JSON", accept: { "application/json": [".json"] } },
          ],
          startIn: last,
        });
        const files = await Promise.all(handles.map((h: any) => h.getFile()));
        if (files.length) {
          await saveLastDir(db, handles[0] as any);
          await handleFolderFiles(files);
        }
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        /* fall back */
      }
    } else if (supportsDir) {
      if (pickerOpen.current) return;
      pickerOpen.current = true;
      try {
        const last = await getLastDir(db);
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
          await saveLastDir(db, dir as any);
          await handleFolderFiles(files);
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
    await exportDeckZip([...selectedIds], db);
  };

  async function handleDelete() {
    await db.transaction("rw", db.decks, () =>
      db.decks.bulkDelete([...selectedIds]),
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
      <button className="btn btn-outline-primary m-1" onClick={pickJson}>
        Import folder
      </button>
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
                <Link to={`../coach/${d.id}`} aria-label="Play">
                  ▶
                </Link>
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
