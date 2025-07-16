import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { usePronunciationCoach } from "../../../apps/sober-body/src/features/games/PronunciationCoach";
import type { SplitMode } from "../../../apps/sober-body/src/features/games/types";
import { splitUnits } from "../../../apps/sober-body/src/features/games/parser";
import useTranslation from "../../pronunciation-coach/src/useTranslation";
import { LANGS } from "../../pronunciation-coach/src/langs";
import { useSettings } from "../../../apps/pronunco/src/features/core/settings-context";
import { useDecks } from "../../../apps/sober-body/src/features/games/deck-context";
import type { Deck } from "../../../apps/sober-body/src/features/games/deck-types";
import GrammarModal from "./GrammarModal";
import { getBriefForDeck, refs } from "../../../apps/sober-body/src/grammar-loader";
import type { BriefWithRefs } from "../../../apps/sober-body/src/grammar-loader";
import { loadBrief } from "../../../apps/sober-body/src/brief-storage";
import useBriefExists from "../../../apps/sober-body/src/useBriefExists";
import { useAzurePronunciation, useAzureBudget, type AzureScore } from "../../azure-speech/src";

interface ChallengePayload {
  id: string;
  title: string;
  units: string[];
  lang: string;
  grammar?: string;
}

const defaultDeck: Deck = {
  id: 'example',
  title: 'Example Lesson',
  lang: 'en-US',
  lines: ['She sells seashells'],
  tags: [],
};

type TranslateMode = 'off' | 'auto-unit' | 'auto-select'

const backgroundThemes = [
  // Travel theme - sky and ocean
  'bg-gradient-to-br from-blue-100 via-indigo-100 to-cyan-100',
  // Business theme - professional and modern
  'bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100',
  // Learning theme - warm and inspiring
  'bg-gradient-to-br from-amber-100 via-orange-100 to-red-100',
  // Nature theme - calming green
  'bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100',
  // Evening theme - peaceful purple
  'bg-gradient-to-br from-purple-100 via-violet-100 to-pink-100'
];

export default function PronunciationCoachUI() {
  const { decks, activeDeck } = useDecks();
  const currentDeck = decks.find(d => d.id === activeDeck) ?? defaultDeck;
  const briefExists = useBriefExists(currentDeck.id);
  
  // Extended deck interface to handle additional fields from wizard
  const extendedDeck = currentDeck as any; // Will contain grammarBrief, vocabulary, complexityLevel if present
  
  // Rotate background every 30 seconds or based on deck ID
  const [currentTheme, setCurrentTheme] = useState(0);
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTheme(prev => (prev + 1) % backgroundThemes.length);
    }, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
  
  // Azure Speech Integration
  const [azureScore, setAzureScore] = useState<AzureScore | null>(null);
  const [azureLoading, setAzureLoading] = useState(false);
  const [showAzureDetails, setShowAzureDetails] = useState(false);
  const audioRecordingRef = useRef<Blob | null>(null);
  const budget = useAzureBudget();
  
  // Right panel tab state
  const [activeRightTab, setActiveRightTab] = useState<'drill' | 'vocabulary' | 'grammar'>('drill');
  const [selectedVocabIndex, setSelectedVocabIndex] = useState(0);

  const shareEnabled = ['word', 'phrase', 'sentence'].includes(mode);

  const handleShareChallenge = async () => {
    if (!shareEnabled) return;

    const challengePayload: ChallengePayload = {
      id: currentDeck.id + '-' + mode + '-' + Date.now(), // Simple unique ID
      title: currentDeck.title,
      units: lines,
      lang: settings.locale,
      // grammar: brief?.story, // Optional: include grammar if available and relevant
    };

    const encodedPayload = encodeURIComponent(btoa(JSON.stringify(challengePayload)));
    const challengeUrl = `${window.location.origin}/pc/c/${encodedPayload}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Challenge: ${currentDeck.title}`,
          text: `Beat my score in ${currentDeck.title}!`, 
          url: challengeUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(challengeUrl);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

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
  
  // Handle Azure scoring after browser scoring completes
  const handleScore = async (result: { score: number; transcript: string; millis: number }) => {
    if (settings.useAzure && !budget.budgetExceeded && audioRecordingRef.current) {
      setAzureLoading(true);
      try {
        const azureResult = await useAzurePronunciation(
          audioRecordingRef.current,
          current,
          settings.locale
        );
        setAzureScore(azureResult);
        
        // Track usage for budget monitoring
        const durationSecs = audioRecordingRef.current.size / 32000;
        budget.addUsageEntry(durationSecs, azureResult.costUSD);
      } catch (error) {
        console.error('Azure scoring failed:', error);
      } finally {
        setAzureLoading(false);
      }
    }
  };
  
  const coach = usePronunciationCoach({ 
    phrase: current, 
    locale: settings.locale,
    onScore: handleScore
  });
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

  // Clear Azure scores when phrase changes
  useEffect(() => {
    setAzureScore(null);
    setShowAzureDetails(false);
  }, [current]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') setShowTranslation(s => !s);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  return (
    <>
    <div className={`min-h-screen py-8 transition-all duration-1000 ${backgroundThemes[currentTheme]}`}>
      <div className="max-w-7xl mx-auto px-[10%] sm:px-[10%] lg:px-[10%]">
        <div className="flex flex-col sm:flex-row min-h-[600px] gap-4 sm:gap-12">
          
          {/* Left Panel - Text Input & Controls */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full" style={{minWidth: '0px', maxWidth: '100%'}}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice Text
                </label>
                <textarea
                  rows={12}
                  className="w-full resize-y min-h-40 max-h-[40vh] max-w-full overflow-y-auto rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  onMouseUp={handleMouseUp}
                  placeholder="Enter text to practice..."
                />
              </div>
              
              <div className="text-xs text-gray-500">
                Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)} ({lines.length} chunks)
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Split Mode
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.locale}
                    onChange={e => setSettings(s => ({ ...s, locale: e.target.value }))}
                  >
                    {LANGS.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Translate to
                </label>
                <select
                  value={settings.nativeLang}
                  onChange={e => setSettings(s => ({ ...s, nativeLang: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LANGS.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => navigate('/decks')}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  📚 Manage Decks
                </button>
                <button 
                  onClick={() => setIndex(0)} 
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  Restart Drill
                </button>
                <button
                  onClick={handleShareChallenge}
                  disabled={!shareEnabled}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors ${shareEnabled ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  🔗 Share Challenge
                </button>
              </div>
              
              {showToast && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
                  Challenge link copied to clipboard!
                </div>
              )}
              
              {/* Theme Selector */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Theme
                </label>
                <div className="flex gap-2 flex-wrap">
                  {backgroundThemes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTheme(index)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${theme} ${
                        currentTheme === index 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={[
                        'Travel (Sky & Ocean)',
                        'Business (Professional)',
                        'Learning (Warm & Inspiring)',
                        'Nature (Calming Green)',
                        'Evening (Peaceful Purple)'
                      ][index]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Tabbed Practice Section */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 w-full" style={{minWidth: '0px', maxWidth: '100%'}}>
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6 pt-4" aria-label="Tabs">
                {[
                  { id: 'drill', label: '🎯 Drill Items', description: 'Practice pronunciation' },
                  { id: 'vocabulary', label: '📖 Vocabulary', description: 'Word definitions' },
                  { id: 'grammar', label: '📝 Grammar', description: 'Language patterns' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRightTab(tab.id as 'drill' | 'vocabulary' | 'grammar')}
                    className={`${
                      activeRightTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    aria-current={activeRightTab === tab.id ? 'page' : undefined}
                  >
                    <div className="text-center">
                      <div>{tab.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              
              {/* Drill Tab */}
              {activeRightTab === 'drill' && (
                <div className="flex flex-col items-center space-y-6">
                  
                  {/* Word List */}
                  {lines.length > 0 && (
                    <div className="w-full">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Practice Units</h3>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
                        <ul className="space-y-1">
                          {lines.map(
                            (line, i) =>
                              line && (
                                <li
                                  key={i}
                                  onClick={() => setIndex(i)}
                                  className={`cursor-pointer px-2 py-1 rounded text-sm transition-colors ${
                                    i === index
                                      ? "bg-blue-100 text-blue-900 font-medium"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  {line}
                                </li>
                              ),
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Current Word Display */}
                  <div className="w-full text-center">
                    <h2 className="text-3xl font-medium text-gray-900 mb-4 select-text bg-gray-50 rounded-lg p-4 border">
                      {current}
                    </h2>
                    
                    {/* Score Display */}
                    {(coach.result !== null || azureScore !== null) && (
                      <div className="mb-4 space-y-2">
                        {/* Browser Score */}
                        {coach.result !== null && (
                          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            Browser clarity: {coach.result}%
                          </div>
                        )}
                        
                        {/* Azure Score */}
                        {settings.useAzure && (
                          <div className="flex flex-col items-center gap-2">
                            {azureLoading ? (
                              <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full mr-2"></div>
                                Azure scoring...
                              </div>
                            ) : azureScore ? (
                              <>
                                <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                  Azure clarity: {azureScore.pronunciation}%
                                </div>
                                <button
                                  onClick={() => setShowAzureDetails(!showAzureDetails)}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  ▶ Details
                                </button>
                                {showAzureDetails && (
                                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 border max-w-sm">
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                      <div>Accuracy: {azureScore.accuracy}%</div>
                                      <div>Fluency: {azureScore.fluency}%</div>
                                      <div>Completeness: {azureScore.completeness}%</div>
                                      <div>Latency: {azureScore.latencyMs}ms</div>
                                    </div>
                                    <div className="text-center font-medium text-amber-600">
                                      Cost: ${azureScore.costUSD.toFixed(4)}
                                    </div>
                                    <details className="mt-2">
                                      <summary className="cursor-pointer text-blue-600">Raw JSON</summary>
                                      <pre className="mt-1 text-xs overflow-auto max-h-32 bg-white p-2 rounded border">
                                        {JSON.stringify(azureScore.json, null, 2)}
                                      </pre>
                                    </details>
                                  </div>
                                )}
                              </>
                            ) : budget.budgetExceeded ? (
                              <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                ⚠️ Daily budget reached
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation */}
                  {lines.length > 0 && (
                    <div className="flex gap-3 pt-4 border-t w-full justify-center">
                      <button
                        onClick={() => setIndex((i) => i - 1)}
                        disabled={index === 0}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-500 flex items-center">
                        {index + 1} of {lines.length}
                      </span>
                      <button
                        onClick={() => setIndex((i) => i + 1)}
                        disabled={index >= lines.length - 1}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Vocabulary Tab */}
              {activeRightTab === 'vocabulary' && (
                <div className="flex flex-col items-center space-y-6">
                  
                  {extendedDeck?.vocabulary?.length > 0 ? (
                    <>
                      {/* Vocabulary List */}
                      <div className="w-full">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Vocabulary Words</h3>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
                          <ul className="space-y-1">
                            {extendedDeck.vocabulary.map((item: any, i: number) => (
                              <li
                                key={i}
                                onClick={() => setSelectedVocabIndex(i)}
                                className={`cursor-pointer px-2 py-1 rounded text-sm transition-colors ${
                                  i === selectedVocabIndex
                                    ? "bg-green-100 text-green-900 font-medium"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                {item.word}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Selected Vocabulary Display */}
                      <div className="w-full text-center">
                        <h2 className="text-3xl font-medium text-gray-900 mb-2 select-text bg-green-50 rounded-lg p-4 border border-green-200">
                          {extendedDeck.vocabulary[selectedVocabIndex]?.word}
                        </h2>
                        <p className="text-lg text-gray-600 mb-4 bg-gray-50 rounded-lg p-3 border">
                          {extendedDeck.vocabulary[selectedVocabIndex]?.definition}
                        </p>
                        
                        {/* Vocabulary Score Display - Same as drill items */}
                        {(coach.result !== null || azureScore !== null) && (
                          <div className="mb-4 space-y-2">
                            {coach.result !== null && (
                              <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                Vocabulary clarity: {coach.result}%
                              </div>
                            )}
                            {settings.useAzure && azureScore && (
                              <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                Azure vocabulary: {azureScore.pronunciation}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Vocabulary Navigation */}
                      <div className="flex gap-3 pt-4 border-t w-full justify-center">
                        <button
                          onClick={() => setSelectedVocabIndex((i) => Math.max(0, i - 1))}
                          disabled={selectedVocabIndex === 0}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ← Previous
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-500 flex items-center">
                          {selectedVocabIndex + 1} of {extendedDeck.vocabulary.length}
                        </span>
                        <button
                          onClick={() => setSelectedVocabIndex((i) => Math.min(extendedDeck.vocabulary.length - 1, i + 1))}
                          disabled={selectedVocabIndex >= extendedDeck.vocabulary.length - 1}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next →
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📚</div>
                      <p className="text-gray-500">No vocabulary available for this deck.</p>
                      <p className="text-sm text-gray-400 mt-2">Vocabulary is available for AI-generated decks.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Grammar Tab */}
              {activeRightTab === 'grammar' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">📝 Grammar</h3>
                  {extendedDeck?.grammarBrief ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                          {extendedDeck.grammarBrief}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <button 
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => {
                            if ('speechSynthesis' in window) {
                              const utterance = new SpeechSynthesisUtterance(extendedDeck.grammarBrief);
                              utterance.lang = currentDeck?.lang || 'en-US';
                              utterance.rate = 0.8; // Slower for grammar explanation
                              speechSynthesis.speak(utterance);
                            }
                          }}
                        >
                          🔊 Read Aloud
                        </button>
                        <button 
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          onClick={() => doTranslate(extendedDeck.grammarBrief)}
                        >
                          🌐 Translate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📝</div>
                      <p className="text-gray-500">No grammar explanation available for this deck.</p>
                      <p className="text-sm text-gray-400 mt-2">Grammar explanations are available for AI-generated decks.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Unified Controls - Always Visible */}
              <div className="border-t pt-6 mt-6">
                
                {/* Main Controls */}
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  <button
                    onClick={() => {
                      if (activeRightTab === 'vocabulary' && extendedDeck?.vocabulary?.length > 0) {
                        // Play vocabulary word
                        const word = extendedDeck.vocabulary[selectedVocabIndex]?.word;
                        if (word && 'speechSynthesis' in window) {
                          const utterance = new SpeechSynthesisUtterance(word);
                          utterance.lang = currentDeck?.lang || 'en-US';
                          speechSynthesis.speak(utterance);
                        }
                      } else {
                        // Play drill item
                        coach.play();
                      }
                    }}
                    title="Play sample"
                    aria-label="Play sample"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
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
                    className={`inline-flex items-center px-4 py-2 rounded-md focus:ring-2 focus:outline-none transition-colors ${
                      coach.recording 
                        ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                        : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {coach.recording ? "■ Stop" : "⏺ Record"}
                  </button>
                  {briefExists && (
                    <button 
                      onClick={handleGrammar} 
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
                    >
                      📖 Grammar
                    </button>
                  )}
                </div>
                
                {/* Translation Controls */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Translation</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={tMode}
                        onChange={e => setTMode(e.target.value as TranslateMode)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="off">Off</option>
                        <option value="auto-unit">Auto</option>
                        <option value="auto-select">On Select</option>
                      </select>
                      <button
                        onClick={() => {
                          if (activeRightTab === 'vocabulary' && extendedDeck?.vocabulary?.length > 0) {
                            // Translate vocabulary word
                            const word = extendedDeck.vocabulary[selectedVocabIndex]?.word;
                            if (word) doTranslate(word);
                          } else {
                            // Translate drill item
                            handleTranslateNow();
                          }
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors"
                      >
                        🔍 Translate Now
                      </button>
                    </div>
                  </div>
                  
                  {translation && showTranslation && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <span className="flex-1 text-sm text-blue-900">{translation}</span>
                      <button
                        onClick={speak}
                        title="Hear translation"
                        aria-label="Hear translation"
                        className="p-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        🔊
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Settings */}
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={settings.slowSpeech}
                        onChange={e => setSettings(s => ({ ...s, slowSpeech: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Slow speech
                    </label>
                    
                    {/* Azure Speech Assessment */}
                    <div className="border-t pt-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">Speech Scoring</div>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={settings.useAzure}
                          onChange={e => setSettings(s => ({ ...s, useAzure: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Use Azure Assessment (beta)
                      </label>
                      {settings.useAzure && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-amber-600">
                            ⚠️ Professional scoring with usage costs ($3/day limit)
                          </div>
                          <div className="text-xs text-gray-500">
                            Today: ${budget.todaySpending.toFixed(2)} / $3.00 
                            (${budget.remainingBudget.toFixed(2)} remaining)
                          </div>
                          {budget.budgetExceeded && (
                            <div className="text-xs text-red-600 font-medium">
                              ⛔ Budget exceeded - scoring paused until midnight
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    <GrammarModal open={Boolean(brief)} brief={brief!} onClose={() => setBrief(null)} />
    </>
  );
}

