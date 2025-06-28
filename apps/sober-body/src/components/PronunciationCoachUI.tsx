import { useState, useEffect } from "react";
import { usePronunciationCoach } from "../features/games/PronunciationCoach";
import useTranslation from "../../../../packages/pronunciation-coach/src/useTranslation";
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
  const [locale, setLocale] = useState<"en-US" | "pt-BR">("en-US");
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const { settings, setSettings } = useSettings();

  useEffect(() => {
    setDeck(splitText(raw, scope));
    setIndex(0);
  }, [raw, scope]);

  const current = deck[index] ?? raw;
  const coach = usePronunciationCoach({ phrase: current, locale });
  const translation = useTranslation(lookupWord ?? '', settings.nativeLang);
  const speak = () => {
    if (!translation) return;
    const utter = new SpeechSynthesisUtterance(translation);
    const voice = speechSynthesis
      .getVoices()
      .find(v => v.lang.startsWith(settings.nativeLang)) ?? null;
    if (voice) utter.voice = voice;
    utter.lang = settings.nativeLang;
    speechSynthesis.speak(utter);
  };

  return (
    <div className="min-h-screen flex justify-center pt-8">
      <div className="grid grid-cols-2 gap-12 w-full max-w-5xl p-4">
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
            value={locale}
            onChange={(e) => setLocale(e.target.value as "en-US" | "pt-BR")}
          >
            <option value="en-US">English</option>
            <option value="pt-BR">Portuguese</option>
          </select>
          <label className="text-sm">Translate to
            <select
              value={settings.nativeLang}
              onChange={e => setSettings(s => ({ ...s, nativeLang: e.target.value }))}
              className="border p-1 ml-1"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="ru">Russian</option>
              <option value="zh-Hans">Chinese (Simplified)</option>
            </select>
          </label>
          <button onClick={() => setIndex(0)} className="border px-2 py-1">
            Restart Drill
          </button>
        </div>
      </section>
      <section className="flex flex-col space-y-4">
        {deck.length > 0 && (
          <ul className="list-disc pl-8 space-y-1 overflow-y-auto w-full max-w-md text-left">
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
        <div className="flex flex-col items-center space-y-3 self-center">
          <h2 className="text-2xl font-semibold text-center">
            {current.split(/\s+/).map((w, i) => (
              <span
                key={i}
                onDoubleClick={() => {
                  setLookupWord(w)
                }}
                className="cursor-help mx-0.5"
              >
                {w + ' '}
              </span>
            ))}
          </h2>
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
          {translation && (
            <div className="px-3 py-2 bg-white/90 rounded-md shadow border text-sm max-w-xs text-center">
              {translation}
              <button onClick={speak} className="ml-2">🔊</button>
            </div>
          )}
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
        </div>
      </section>
      </div>
    </div>
  );
}
