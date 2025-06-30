import React, { useState } from "react";

export default function TagsInput({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (t: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const val = draft.trim();
    if (!val) return;
    if (!tags.includes(val)) setTags([...tags, val]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap gap-1 border p-2 rounded">
      {tags.map((t) => (
        <span key={t} className="bg-sky-100 px-2 py-0.5 rounded-full text-xs">
          {t}{" "}
          <button
            onClick={() => setTags(tags.filter((x) => x !== t))}
            aria-label="Remove tag"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && draft === "") {
            setTags(tags.slice(0, -1));
          }
        }}
        placeholder="Type tag and press Enter (e.g. groceries, A1, travel)"
        className="flex-1 min-w-[6rem] text-xs focus:outline-none"
      />
    </div>
  );
}
