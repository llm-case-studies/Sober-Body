import { useState } from "react";
import { LANGS } from "../../../../packages/pronunciation-coach/src/langs";
import type { Deck } from "../features/games/deck-types";
import TagsInput from "./TagsInput";
import CategoryInput from "./CategoryInput";

export default function DeckModal({
  deck,
  onSave,
  onClose,
  allCats
}: {
  deck: Deck;
  onSave: (d: Deck) => void;
  onClose: () => void;
  allCats: string[];
}) {
  const [d, setD] = useState(deck);
  const [categories, setCategories] = useState(
    (deck.tags ?? []).filter(t => t.startsWith('cat:'))
  );
  const [tags, setTags] = useState(
    (deck.tags ?? []).filter(t => !t.startsWith('cat:'))
  );
  const ro = !!deck.sig;
  const upd = (f: Partial<Deck>) => setD((o) => ({ ...o, ...f }));
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded space-y-2 w-80">
        <input
          className="border w-full p-1"
          disabled={ro}
          value={d.title}
          onChange={(e) => upd({ title: e.target.value })}
        />
        <select
          className="border w-full p-1"
          disabled={ro}
          value={d.lang}
          onChange={(e) => upd({ lang: e.target.value })}
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        {ro ? (
          <input
            className="border w-full p-1"
            disabled
            value={categories.join(' ')}
          />
        ) : (
          <CategoryInput value={categories} setValue={setCategories} options={allCats} />
        )}
        {ro ? (
          <input
            className="border w-full p-1"
            disabled
            value={tags.join(' ')}
          />
        ) : (
          <TagsInput tags={tags} setTags={setTags} />
        )}
        <textarea
          className="border w-full h-32 p-1"
          disabled={ro}
          value={d.lines.join("\n")}
          onChange={(e) =>
            upd({ lines: e.target.value.split(/\r?\n/).filter(Boolean) })
          }
        />
        <div className="flex justify-end gap-2">
          {!ro && (
            <button
              className="border px-2"
              onClick={() =>
                onSave({
                  ...d,
                  tags: [...categories, ...tags],
                })
              }
            >
              Save
            </button>
          )}
          <button className="border px-2" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
