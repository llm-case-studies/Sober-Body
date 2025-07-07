import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { usePronunciationCoach } from "../../../apps/sober-body/src/features/games/PronunciationCoach";
import type { SplitMode } from "../../../apps/sober-body/src/features/games/types";
import { splitUnits } from "../../../apps/sober-body/src/features/games/parser";
import useTranslation from "../../pronunciation-coach/src/useTranslation";
import { LANGS } from "../../pronunciation-coach/src/langs";
import { useSettings } from "../../../apps/sober-body/src/features/core/settings-context";
import { useDecks } from "../../../apps/sober-body/src/features/games/deck-context";
import type { Deck } from "../../../apps/sober-body/src/features/games/deck-types";
import GrammarModal from "./GrammarModal";
import { getBriefForDeck, refs } from "../../../apps/sober-body/src/grammar-loader";
import type { BriefWithRefs } from "../../../apps/sober-body/src/grammar-loader";
import { loadBrief } from "../../../apps/sober-body/src/brief-storage";
import useBriefExists from "../../../apps/sober-body/src/useBriefExists";

const defaultDeck: Deck = {
  id: 'example',
  title: 'Example Lesson',
  lang: 'en-US',
  lines: ['She sells seashells'],
  tags: [],
};

type TranslateMode = 'off' | 'auto-unit' | 'auto-select'

export default function PronunciationCoachUI() {
  const { decks, activeDeck } = useDecks();
  const currentDeck = decks.find(d => d.id === activeDeck) ?? defaultDeck;
  const briefExists = useBriefExists(currentDeck.id);

  const [raw, setRaw] = useState(currentDeck.lines.join('\n'));
  const [mode, setMode] = useState<SplitMode>('line');
  const [lines, setLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [tMode, setTMode] = useState<TranslateMode>(
    (localStorage.getItem('pc_translateMode') as TranslateMode) ?? 'off'
  )
  const { settings, setSettings } = useSettings();
  const navigate = useNavigate();
  const [brief, setBrief] = useState<BriefWithRefs | null>(null);

  useEffect(() => {
    localStorage.setItem('pc_translateMode', tMode)
  }, [tMode])

  useEffect(() => {
    setRaw(currentDeck.lines.join('\n'));
  }, [currentDeck]);

  useEffect(() => {
    setLines(splitUnits(raw, mode));
    setIndex(0);
  }, [raw, mode]);

  useEffect(() => {
    setIndex(0);
    setSettings(s => ({ ...s, locale: currentDeck.lang }))
  }, [currentDeck.id, currentDeck.lang, setSettings]);


  const current = lines[index] ?? raw;
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

  const doTranslate = (text: string) => {
    const cleaned = text.replace(/[^\p{L}\p{N}\s]+/gu, '')
    setLookupWord(cleaned)
  }

  const handleMouseUp = () => {
    if (tMode !== 'auto-select') return
    const sel = window.getSelection()?.toString().trim() || ''
    doTranslate(sel || current)
  }

  const handleTranslateNow = () => {
    const sel = window.getSelection()?.toString().trim() || ''
    doTranslate(sel || current)
  }

  const handleGrammar = async () => {
    const stored = await loadBrief(currentDeck.id)
    if (stored) {
      const linkedRefs = [
        ...stored.grammar.verb_tenses,
        ...stored.grammar.prepositions,
      ].map(id => refs[id]).filter(Boolean)
      setBrief({
        id: stored.deckId,
        story: stored.deckId,
        grammar: stored.grammar,
        notes: stored.notes ? [stored.notes] : undefined,
        linkedRefs,
      })
      return
    }
    const b = getBriefForDeck(currentDeck.id)
    if (!b) {
      alert('No grammar notes for this deck yet.')
    } else {
      setBrief(b)
    }
  }

  useEffect(() => {
    if (translation) speak();
  }, [translation]);

  useEffect(() => {
    if (tMode === 'auto-unit') doTranslate(current)
  }, [current, tMode])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') setShowTranslation(s => !s);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  return (
    <>
    <div
      className="grid grid-cols-2 gap-x-28 gap-y-12 max-w-7xl mx-auto px-10 pt-10"
    >
      <section className="flex flex-col space-y-2">
        <textarea
          rows={14}
          className="w-full resize-y min-h-40 max-h-[70vh] overflow-y-auto border p-2 bg-[rgba(255,255,255,0.8)] backdrop-blur-sm"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onMouseUp={handleMouseUp}
        />
        <div className="text-xs">Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)} ({lines.length} chunks)</div>
        <div className="flex gap-2 items-center">
          <select
            className="border p-1"
            value={mode}
            onChange={(e) => setMode(e.target.value as SplitMode)}
          >
            <option value="word">Word</option>
            <option value="line">Line</option>
            <option value="phrase">Phrase</option>
            <option value="sentence">Sentence</option>
            <option value="paragraph">Paragraph</option>
            <option value="full">Full</option>
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
          <button
            onClick={() => navigate('/decks')}
            className="border px-2 py-1"
          >
            📚 Manage Decks
          </button>
          <button onClick={() => setIndex(0)} className="border px-2 py-1">
            Restart Drill
          </button>
        </div>
      </section>
      <section className="flex flex-col items-center">
        {lines.length > 0 && (
          <ul className="list-disc pl-12 pr-8 space-y-1 overflow-y-auto max-h-[70vh]">
            {lines.map(
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
        >
          {current}
        </h2>
        <div className="flex gap-4 mb-8">
            <button
              onClick={coach.play}
              title="Play sample"
              aria-label="Play sample"
              className="px-3 py-1 text-lg"
            >
              ▶ Play
            </button>
            <button
              disabled={
                !(
                  "SpeechRecognition" in window ||
                  "webkitSpeechRecognition" in window
                )
              }
              onClick={coach.recording ? coach.stop : coach.start}
              title={coach.recording ? "Stop recording" : "Record your voice"}
              aria-label={coach.recording ? "Stop recording" : "Record your voice"}
              className="px-3 py-1 text-lg"
            >
              {coach.recording ? "■ Stop" : "⏺ Record"}
            </button>
            {briefExists && (
              <button onClick={handleGrammar} className="px-3 py-1 text-lg">
                📖 Grammar
              </button>
            )}
            <label className="ml-2 text-sm flex items-center gap-1">Translate:
              <select
                value={tMode}
                onChange={e => setTMode(e.target.value as TranslateMode)}
                className="border p-1 ml-1"
              >
                <option value="off">Off</option>
                <option value="auto-unit">Auto</option>
                <option value="auto-select">On Select</option>
              </select>
            </label>
            <button
              onClick={handleTranslateNow}
              className="px-3 py-1 text-lg"
            >
              🔍 Translate Now
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
            <div className="flex items-center gap-2 flex-wrap mb-8 rounded-md border px-4 py-2 bg-white/90 shadow max-w-[60%] text-sm">
              <span>{translation}</span>
              <button
                onClick={speak}
                title="Hear translation"
                aria-label="Hear translation"
                className="ml-2 text-lg"
              >
                🔊
              </button>
            </div>
          )}
        {lines.length > 0 && (
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
                disabled={index >= lines.length - 1}
                className="border px-2 py-1"
              >
                Next
              </button>
            </div>
          )}
      </section>
    </div>
    <GrammarModal open={Boolean(brief)} brief={brief!} onClose={() => setBrief(null)} />
    </>
  );
}

