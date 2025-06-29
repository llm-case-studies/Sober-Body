import { useState, useEffect } from "react";
import { usePronunciationCoach } from "../features/games/PronunciationCoach";
import useTranslation from "../../../../packages/pronunciation-coach/src/useTranslation";
import { LANGS } from "../../../../packages/pronunciation-coach/src/langs";
import { useSettings } from "../features/core/settings-context";

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
  const [scope, setScope] = useState<Scope>("Line");
  const [deck, setDeck] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const { settings, setSettings } = useSettings();

  useEffect(() => {
    setDeck(splitText(raw, scope));
    setIndex(0);
  }, [raw, scope]);


  const current = deck[index] ?? raw;
  const coach = usePronunciationCoach({ phrase: current, locale: settings.locale });
  const translation = useTranslation(lookupWord ?? '', settings.nativeLang);
  const speak = () => {
    if (!translation) return;
    const utter = new SpeechSynthesisUtterance(translation);
    const voice = speechSynthesis
      .getVoices()
      .find(v => v.lang.startsWith(settings.nativeLang)) ?? null;
    utter.voice = voice || null;
    utter.lang = settings.nativeLang;
    utter.rate = settings.slowSpeech ? 0.7 : 0.9;
    utter.pitch = 1.0;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  useEffect(() => {
    if (translation) speak();
  }, [translation]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') setShowTranslation(s => !s);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  return (
    <div
      className="mx-auto max-w-7xl grid grid-cols-2 gap-x-24 gap-y-12 px-8 pt-10"
    >
      <section className="flex flex-col space-y-2">
        <textarea
          rows={14}
          className="w-full resize-y min-h-40 max-h-[70vh] overflow-y-auto border p-2 bg-[rgba(255,255,255,0.8)] backdrop-blur-sm"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <select
            className="border p-1"
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
          >
            <option>Word</option>
            <option>Line</option>
            <option>Sentence</option>
            <option>Paragraph</option>
            <option>Full</option>
          </select>
          <select
            className="border p-1"
            value={settings.locale}
            onChange={e => setSettings(s => ({ ...s, locale: e.target.value }))}
          >
            {LANGS.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <label className="text-sm">Translate to
            <select
              value={settings.nativeLang}
              onChange={e => setSettings(s => ({ ...s, nativeLang: e.target.value }))}
              className="border p-1 ml-1"
            >
              {LANGS.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
          <button onClick={() => setIndex(0)} className="border px-2 py-1">
            Restart Drill
          </button>
        </div>
      </section>
      <section className="flex flex-col items-center">
        {deck.length > 0 && (
          <ul className="list-disc pl-10 pr-6 space-y-1 overflow-y-auto w-full max-w-md">
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
        <h2
          className="text-2xl text-center mb-8 select-text"
          onMouseUp={() => {
            const raw = window.getSelection()?.toString().trim();
            if (!raw) return;
            const cleaned = raw.replace(/[^\p{L}\p{N}\s]+/gu, '');
            setLookupWord(cleaned);
          }}
        >
          {current}
        </h2>
        <div className="flex gap-4 mb-8">
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
        <label className="text-xs mt-2 flex items-center gap-1">
          <input
            type="checkbox"
            checked={settings.slowSpeech}
            onChange={e => setSettings(s => ({ ...s, slowSpeech: e.target.checked }))}
          />
          Slow speak
        </label>
        {translation && showTranslation && (
            <div className="flex items-center gap-2 mb-8 rounded-md border px-4 py-2 bg-white/90 shadow max-w-xs text-sm">
              <span>{translation}</span>
              <button onClick={speak}>🔊</button>
            </div>
          )}
        {deck.length > 0 && (
            <div className="flex gap-4">
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
