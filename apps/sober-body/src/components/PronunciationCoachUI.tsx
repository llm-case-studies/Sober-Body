import { useState } from "react";
import { usePronunciationCoach } from "../features/games/PronunciationCoach";

type Scope = "Word" | "Line" | "Sentence" | "Paragraph" | "Full";

function splitText(raw: string, scope: Scope): string[] {
  const trimmed = raw.trim();
  switch (scope) {
    case "Word":
      return trimmed.split(/\s+/).filter(Boolean);
    case "Line":
      return trimmed
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    case "Sentence":
      return trimmed
        .replace(/\r?\n/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    case "Paragraph":
      return trimmed
        .split(/\r?\n\s*\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    case "Full":
    default:
      return trimmed ? [trimmed] : [];
  }
}

export default function PronunciationCoachUI() {
  const [raw, setRaw] = useState("She sells seashells");
  const [deck, setDeck] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [locale, setLocale] = useState<"en-US" | "pt-BR">("en-US");
  const [gran, setGran] = useState("Line");

  const start = () => {
    const lines = splitText(raw, gran as Scope);
    setDeck(lines);
    setIndex(0);
  };

  const current = deck[index] ?? raw;
  const coach = usePronunciationCoach({ phrase: current, locale });

  return (
    <div className="grid gap-6 w-full p-4 sm:grid-cols-2">
      <section className="flex flex-col space-y-2">
        <textarea
          rows={14}
          className="w-full resize-y min-h-40 max-h-[70vh] overflow-y-auto border p-2"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <select
            className="border p-1"
            value={gran}
            onChange={(e) => setGran(e.target.value)}
          >
            <option>Word</option>
            <option>Line</option>
            <option>Sentence</option>
            <option>Paragraph</option>
            <option>Full</option>
          </select>
          <select
            className="border p-1"
            value={locale}
            onChange={(e) => setLocale(e.target.value as "en-US" | "pt-BR")}
          >
            <option value="en-US">English</option>
            <option value="pt-BR">Portuguese</option>
          </select>
          <button onClick={start} className="border px-2 py-1">
            Start Drill
          </button>
        </div>
      </section>
      <section className="flex flex-col items-center space-y-4">
        {deck.length > 0 && (
          <ul className="list-disc pl-6 space-y-1 overflow-y-auto w-full max-w-md">
            {deck.map(
              (line, i) =>
                line && (
                  <li
                    key={i}
                    onClick={() => setIndex(i)}
                    className={
                      i === index
                        ? "font-bold cursor-pointer"
                        : "cursor-pointer"
                    }
                  >
                    {line}
                  </li>
                ),
            )}
          </ul>
        )}
        <h2 className="text-2xl text-center">{current}</h2>
        <div className="flex gap-2 items-center">
          <button onClick={coach.play}>▶ Play</button>
          <button
            disabled={
              !(
                "SpeechRecognition" in window ||
                "webkitSpeechRecognition" in window
              )
            }
            onClick={coach.recording ? coach.stop : coach.start}
          >
            {coach.recording ? "■ Stop" : "⏺ Record"}
          </button>
          {coach.result !== null && <span>Score {coach.result}%</span>}
        </div>
        {deck.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setIndex((i) => i - 1)}
              disabled={index === 0}
              className="border px-2 py-1"
            >
              Prev
            </button>
            <button
              onClick={() => setIndex((i) => i + 1)}
              disabled={index >= deck.length - 1}
              className="border px-2 py-1"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
