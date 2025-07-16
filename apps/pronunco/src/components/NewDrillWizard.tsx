import { useState } from 'react';
import { LANGS } from '../../../../packages/pronunciation-coach/src/langs';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import openai from '../openai';
import { db } from '../db';
import { saveDeck } from '../../../sober-body/src/features/games/deck-storage';
import GrammarModal from './GrammarModal';
import { toast } from '../toast';
import { useSettings } from '../features/core/settings-context';
import { useIsMobile } from 'ui';
import { useDecks } from '../../../sober-body/src/features/games/deck-context';

type WizardMode = 'setup' | 'generating' | 'preview' | 'offline' | 'paywall' | 'manual' | 'text-analysis' | 'deck-preview';

export default function NewDrillWizard({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const { settings } = useSettings();
  const isMobile = useIsMobile();
  const [step,setStep]=useState(1);
  const [mode, setMode] = useState<WizardMode>('setup');
  const [topic,setTopic]=useState('');
  const [count,setCount]=useState(10);
  const [lang,setLang]=useState(settings.locale);
  const [preview,setPreview]=useState('');
  const [loading,setLoading]=useState(false);
  const [grammarBrief, setGrammarBrief] = useState('');
  const [vocabulary, setVocabulary] = useState<{ word: string; definition: string }[]>([]);
  const [complexityLevel, setComplexityLevel] = useState('');
  const [editOpen,setEditOpen]=useState(false);
  const navigate=useNavigate();
  const [showManualEditOption, setShowManualEditOption] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [enhancementType, setEnhancementType] = useState<'enrich' | 'difficulty'>('enrich');
  const [addVocabulary, setAddVocabulary] = useState(true);
  const [addGrammar, setAddGrammar] = useState(true);

  // Get available folders for selection
  const folders = useLiveQuery(() => db().folders?.toArray() ?? [], [], []) || [];
  
  // Get existing decks for enhancement (safe for tests)
  let decks: any[] = [];
  try {
    const { decks: contextDecks } = useDecks();
    decks = contextDecks || [];
  } catch (error) {
    // useDecks hook not available (likely in test environment)
    decks = [];
  }

  if(!open) return null;

  // Decision tree implementation per o3 specs
  const generate = async () => {
    // Step 1: Check if online
    if (!navigator.onLine) {
      setMode('offline');
      return;
    }

    // Step 2: Check if Pro user
    if (!settings.isPro) {
      setMode('paywall');
      return;
    }

    // Step 3: Call OpenAI (Pro + online)
    try {
      setLoading(true);
      setMode('generating');
      
      const res = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `Generate a JSON object for a pronunciation drill. The topic is "${topic}" in ${lang}. Include ${count} phrases, a detailed grammar explanation with examples, a list of key vocabulary words with definitions, and a complexity level (e.g., "Beginner", "Intermediate", "Advanced").
          
          JSON Structure:
          {
            "title": "[Deck Title]",
            "lang": "[Language Code, e.g., en-US]",
            "phrases": ["phrase1", "phrase2", ...],
            "grammarBrief": "[Detailed grammar explanation with specific examples from the phrases. Include patterns, rules, and 2-3 concrete examples.]",
            "vocabulary": [{"word": "word1", "definition": "definition1"}],
            "complexityLevel": "[Complexity Level]"
          }`
        }],
        response_format: { type: "json_object" },
      });

      const content = res.choices[0].message.content || '';
      let parsedContent: any;
      
      try {
        parsedContent = JSON.parse(content);
      } catch (jsonError) {
        console.warn("Direct JSON parse failed, attempting markdown extraction:", jsonError);
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedContent = JSON.parse(jsonMatch[1]);
          } catch (extractError) {
            throw new Error("Failed to parse AI response");
          }
        } else {
          throw new Error("AI response not in expected JSON format");
        }
      }
      
      setPreview(parsedContent.phrases.join('\n'));
      setGrammarBrief(parsedContent.grammarBrief || '');
      setVocabulary(parsedContent.vocabulary || []);
      setComplexityLevel(parsedContent.complexityLevel || '');
      setMode('preview');
      setStep(2);
      
    } catch (e: any) {
      console.error("OpenAI generation failed:", e);
      toast.error('Generation failed, switching to manual mode.');
      setMode('manual');
    } finally {
      setLoading(false);
    }
  };

  const goManual = () => {
    setPreview(topic || ''); // Use topic as initial content
    setGrammarBrief('');
    setVocabulary([]);
    setComplexityLevel('');
    setMode('manual');
    setStep(2);
  };

  const retryGenerate = () => {
    setMode('setup');
    generate();
  };

  const enhanceDeck = async () => {
    const selectedDeck = decks.find(d => d.id === selectedDeckId);
    if (!selectedDeck) return;

    // Step 1: Check if online
    if (!navigator.onLine) {
      setMode('offline');
      return;
    }

    // Step 2: Check if Pro user
    if (!settings.isPro) {
      setMode('paywall');
      return;
    }

    // Step 3: Enhance the selected deck
    try {
      setLoading(true);
      setMode('generating');
      
      if (enhancementType === 'enrich') {
        // Add vocabulary and grammar to existing deck
        const contentRequests = [];
        if (addGrammar) contentRequests.push('detailed grammar explanation identifying patterns, verb tenses, sentence structures');
        if (addVocabulary) contentRequests.push('key vocabulary words with definitions');
        
        const res = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: `Analyze this ${selectedDeck.lang} pronunciation drill and add educational content: ${contentRequests.join(' and ')}.
            
Deck Title: "${selectedDeck.title}"
Language: ${selectedDeck.lang}
Phrases: ${selectedDeck.lines?.join('\n')}

Generate a JSON object with:
{
  "title": "${selectedDeck.title} (Enhanced)",
  "lang": "${selectedDeck.lang}",
  "phrases": [keep original phrases exactly as provided],
  ${addGrammar ? '"grammarBrief": "[Detailed grammar explanation identifying patterns, verb tenses, sentence structures in the given phrases. Provide 2-3 concrete examples from the phrases.]",' : '"grammarBrief": "",'}
  ${addVocabulary ? '"vocabulary": [{"word": "word1", "definition": "definition1"}],' : '"vocabulary": [],'}
  "complexityLevel": "[Beginner/Intermediate/Advanced based on phrase complexity]"
}`
          }],
          response_format: { type: "json_object" },
        });

        const content = res.choices[0].message.content || '';
        const parsedContent = JSON.parse(content);
        
        setPreview(parsedContent.phrases.join('\n'));
        setTopic(parsedContent.title);
        setGrammarBrief(parsedContent.grammarBrief || '');
        setVocabulary(parsedContent.vocabulary || []);
        setComplexityLevel(parsedContent.complexityLevel || '');
        
      } else if (enhancementType === 'difficulty') {
        // Create difficulty progression variants
        const res = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: `Create a difficulty progression for this ${selectedDeck.lang} pronunciation drill. Generate Basic, Intermediate, and Advanced versions.

Original Deck: "${selectedDeck.title}"
Language: ${selectedDeck.lang}
Original Phrases: ${selectedDeck.lines?.join('\n')}

Generate a JSON object with THREE difficulty levels:
{
  "basic": {
    "title": "${selectedDeck.title} (Basic)",
    "lang": "${selectedDeck.lang}",
    "phrases": [simplified phrases with easier vocabulary and shorter sentences],
    "grammarBrief": "[Simple grammar explanation for beginners]",
    "vocabulary": [{"word": "basic_word", "definition": "simple definition"}],
    "complexityLevel": "Beginner"
  },
  "intermediate": {
    "title": "${selectedDeck.title} (Intermediate)", 
    "lang": "${selectedDeck.lang}",
    "phrases": [original phrases or slightly modified],
    "grammarBrief": "[Intermediate grammar explanation]",
    "vocabulary": [{"word": "intermediate_word", "definition": "detailed definition"}],
    "complexityLevel": "Intermediate"
  },
  "advanced": {
    "title": "${selectedDeck.title} (Advanced)",
    "lang": "${selectedDeck.lang}",
    "phrases": [more complex phrases with advanced vocabulary and longer sentences],
    "grammarBrief": "[Advanced grammar explanation with nuances]",
    "vocabulary": [{"word": "advanced_word", "definition": "sophisticated definition"}],
    "complexityLevel": "Advanced"
  }
}`
          }],
          response_format: { type: "json_object" },
        });

        const content = res.choices[0].message.content || '';
        const parsedContent = JSON.parse(content);
        
        // For now, show the intermediate version in preview
        // TODO: Allow user to choose which difficulty to save
        const intermediate = parsedContent.intermediate;
        setPreview(intermediate.phrases.join('\n'));
        setTopic(intermediate.title);
        setGrammarBrief(intermediate.grammarBrief || '');
        setVocabulary(intermediate.vocabulary || []);
        setComplexityLevel(intermediate.complexityLevel || '');
      }
      
      setMode('preview');
      setStep(2);
      
    } catch (e: any) {
      console.error("Deck enhancement failed:", e);
      toast.error('Enhancement failed, please try again.');
      setMode('setup');
    } finally {
      setLoading(false);
    }
  };

  const analyzeText = async () => {
    // Step 1: Check if online
    if (!navigator.onLine) {
      setMode('offline');
      return;
    }

    // Step 2: Check if Pro user
    if (!settings.isPro) {
      setMode('paywall');
      return;
    }

    // Step 3: Analyze provided text (Pro + online)
    try {
      setLoading(true);
      setMode('generating');
      
      const res = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `Analyze this ${lang} text and generate vocabulary and grammar explanation. The text is: "${inputText}"
          
          Generate a JSON object with:
          {
            "title": "[Generated title based on content]",
            "lang": "${lang}",
            "phrases": [split text into individual phrases/sentences],
            "grammarBrief": "[Detailed grammar explanation with specific examples from the text. Identify key grammar patterns, verb tenses, sentence structures, and provide 2-3 concrete examples from the given text.]",
            "vocabulary": [{"word": "word1", "definition": "definition1"}],
            "complexityLevel": "[Complexity Level]"
          }`
        }],
        response_format: { type: "json_object" },
      });

      const content = res.choices[0].message.content || '';
      let parsedContent: any;
      
      try {
        parsedContent = JSON.parse(content);
      } catch (jsonError) {
        console.warn("Direct JSON parse failed, attempting markdown extraction:", jsonError);
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedContent = JSON.parse(jsonMatch[1]);
          } catch (extractError) {
            throw new Error("Failed to parse AI response");
          }
        } else {
          throw new Error("AI response not in expected JSON format");
        }
      }
      
      setPreview(parsedContent.phrases.join('\n'));
      setTopic(parsedContent.title || topic);
      setGrammarBrief(parsedContent.grammarBrief || '');
      setVocabulary(parsedContent.vocabulary || []);
      setComplexityLevel(parsedContent.complexityLevel || '');
      setMode('preview');
      setStep(2);
      
    } catch (e: any) {
      console.error("Text analysis failed:", e);
      toast.error('Analysis failed, switching to manual mode.');
      setPreview(inputText); // Use original text as fallback
      setMode('manual');
    } finally {
      setLoading(false);
    }
  };

  const save=async()=>{
    try {
      const lines=preview.split('\n').filter(Boolean);
      const deckData = {
        id: crypto.randomUUID(),
        title: topic,
        lang,
        lines,
        grammarBrief,
        vocabulary,
        complexityLevel,
        tags: selectedFolderId ? [`folder:${selectedFolderId}`] : [],
        updated: Date.now()
      };
      
      // Save to SoberBody storage (for coach compatibility)
      await saveDeck(deckData);
      
      // Also save folder info to PronunCo for folder organization
      if (selectedFolderId) {
        const folder = folders.find(f => f.id === selectedFolderId);
        if (folder?.diskPath) {
          // TODO: Implement disk sync when folder sync is ready
          console.log(`Would sync deck "${topic}" to disk path: ${folder.diskPath}`);
        }
      }
      
      navigate(`/pc/coach/${deckData.id}`);
      toast.success(`Drill "${topic}" created successfully! 🎉`);
      onClose();
    } catch (error) {
      console.error('Failed to save drill:', error);
      toast.error('Failed to save drill. Please try again.');
    }
  };

  const handleManualEdit = () => {
    setPreview(topic); // Use topic as initial content for manual edit
    setGrammarBrief('');
    setVocabulary([]);
    setComplexityLevel('');
    setStep(2);
    setShowManualEditOption(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white ${isMobile ? 'p-4' : 'p-6'} rounded-lg w-full ${isMobile ? 'max-w-full' : 'max-w-4xl'} max-h-[90vh] overflow-y-auto space-y-4`}>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">New Drill</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>

        {/* Setup Mode */}
        {mode === 'setup' && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode Selection
                </label>
                <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-4'} mb-4`}>
                  <button 
                    className={`px-4 ${isMobile ? 'py-3' : 'py-2'} rounded border ${step === 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setStep(1)}
                  >
                    Generate from Topic
                  </button>
                  <button 
                    className={`px-4 ${isMobile ? 'py-3' : 'py-2'} rounded border ${step === 3 ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setStep(3)}
                  >
                    Analyze Existing Text
                  </button>
                  <button 
                    className={`px-4 ${isMobile ? 'py-3' : 'py-2'} rounded border ${step === 4 ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setStep(4)}
                  >
                    🔧 Enhance Existing Deck
                  </button>
                </div>
              </div>

              {step === 1 && (
                <>
                  <input 
                    className="border w-full p-2 rounded" 
                    placeholder="Ordering food in Spain" 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)} 
                  />
                  <input 
                    type="number" 
                    className="border w-full p-2 rounded" 
                    min={1} 
                    max={30} 
                    value={count} 
                    onChange={e => setCount(Number(e.target.value))} 
                    placeholder="Number of phrases"
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <input 
                    className="border w-full p-2 rounded" 
                    placeholder="Title for this lesson" 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)} 
                  />
                  <textarea
                    className="border w-full p-2 rounded h-32"
                    placeholder="Paste your existing text here...&#10;The AI will analyze it and generate vocabulary and grammar explanations."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                  />
                </>
              )}

              {step === 4 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Deck to Enhance
                    </label>
                    <select 
                      className="border w-full p-2 rounded" 
                      value={selectedDeckId} 
                      onChange={e => setSelectedDeckId(e.target.value)}
                    >
                      <option value="">Choose a deck... ({decks.length} available)</option>
                      {(() => {
                        // Group decks by folder
                        const folderMap = new Map<string, typeof decks>();
                        const unorganizedDecks: typeof decks = [];
                        
                        decks.forEach(deck => {
                          const folderTag = deck.tags?.find(tag => tag.startsWith('folder:'));
                          if (folderTag) {
                            const folderId = folderTag.replace('folder:', '');
                            if (!folderMap.has(folderId)) {
                              folderMap.set(folderId, []);
                            }
                            folderMap.get(folderId)!.push(deck);
                          } else {
                            unorganizedDecks.push(deck);
                          }
                        });
                        
                        const renderDeckOption = (deck: typeof decks[0]) => {
                          const extendedDeck = deck as any;
                          const hasVocab = extendedDeck.vocabulary && extendedDeck.vocabulary.length > 0;
                          const hasGrammar = extendedDeck.grammarBrief && extendedDeck.grammarBrief.trim();
                          const difficulty = extendedDeck.complexityLevel || 'Unknown';
                          
                          const indicators = [];
                          if (hasVocab) indicators.push('📖V');
                          if (hasGrammar) indicators.push('📝G');
                          indicators.push(`💡${difficulty.charAt(0)}`);
                          
                          return (
                            <option key={deck.id} value={deck.id}>
                              {deck.title} ({deck.lang}) - {deck.lines?.length || 0} phrases {indicators.length > 0 ? `[${indicators.join(' ')}]` : '[Basic]'}
                            </option>
                          );
                        };
                        
                        const elements = [];
                        
                        // Add folder groups
                        Array.from(folderMap.entries()).forEach(([folderId, folderDecks]) => {
                          const folder = folders.find(f => f.id === folderId);
                          const folderName = folder?.name || 'Unknown Folder';
                          
                          elements.push(
                            <optgroup key={folderId} label={`📁 ${folderName}`}>
                              {folderDecks.map(renderDeckOption)}
                            </optgroup>
                          );
                        });
                        
                        // Add unorganized decks
                        if (unorganizedDecks.length > 0) {
                          elements.push(
                            <optgroup key="unorganized" label="📂 Unorganized">
                              {unorganizedDecks.map(renderDeckOption)}
                            </optgroup>
                          );
                        }
                        
                        return elements;
                      })()}
                    </select>
                    {decks.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        No decks available. Create some decks first to use the enhancement feature.
                      </p>
                    )}
                  </div>
                </>
              )}

              <select className="border w-full p-2 rounded" value={lang} onChange={e => setLang(e.target.value)}>
                {LANGS.map(l => (<option key={l.code} value={l.code}>{l.label}</option>))}
              </select>

              <div className="flex justify-between">
                <button className="border px-4 py-2 rounded hover:bg-gray-50" onClick={goManual}>
                  Manual Entry
                </button>
                <div className="space-x-2">
                  {step === 1 && (
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
                      disabled={!topic} 
                      onClick={generate}
                    >
                      Generate Drill
                    </button>
                  )}
                  {step === 3 && (
                    <button 
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" 
                      disabled={!inputText.trim() || !topic} 
                      onClick={analyzeText}
                    >
                      Analyze Text
                    </button>
                  )}
                  {step === 4 && (
                    <button 
                      className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50" 
                      disabled={!selectedDeckId} 
                      onClick={() => {
                        const selectedDeck = decks.find(d => d.id === selectedDeckId);
                        if (selectedDeck) {
                          setTopic(selectedDeck.title);
                          setPreview(selectedDeck.lines?.join('\n') || '');
                          setMode('deck-preview');
                        }
                      }}
                    >
                      Preview & Enhance
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Generating Mode */}
        {mode === 'generating' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Generating drill (GPT-4o)...</p>
          </div>
        )}

        {/* Offline Modal */}
        {mode === 'offline' && (
          <>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">📡 Offline Mode</h3>
              <p className="text-gray-700 mb-4">
                Auto-generate requires an internet connection. You can still type grammar & lines manually or try again once you're back online.
              </p>
            </div>
            <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
              <button 
                className={`flex-1 border px-4 ${isMobile ? 'py-3' : 'py-2'} rounded hover:bg-gray-50`} 
                onClick={goManual}
              >
                Go Manual
              </button>
              <button 
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
                onClick={retryGenerate}
              >
                Retry
              </button>
            </div>
          </>
        )}

        {/* Paywall Modal */}
        {mode === 'paywall' && (
          <>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">⭐ Pro Feature</h3>
              <p className="text-gray-700 mb-4">
                AI-generated drills are part of the Pro plan ($4.99/mo).
              </p>
            </div>
            <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
              <button 
                className={`flex-1 border px-4 ${isMobile ? 'py-3' : 'py-2'} rounded hover:bg-gray-50`} 
                onClick={goManual}
              >
                Go Manual
              </button>
              <button 
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded hover:from-yellow-500 hover:to-orange-600" 
                onClick={() => toast.success('Stripe integration coming soon!')}
              >
                Upgrade Now
              </button>
            </div>
          </>
        )}

        {/* Manual Entry Mode */}
        {mode === 'manual' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drill Lines (one per line)
              </label>
              <textarea
                className="w-full border rounded p-2 h-32 text-sm"
                placeholder="Enter your phrases here, one per line:&#10;How much does this cost?&#10;Where is the bathroom?&#10;I would like to order..."
                value={preview}
                onChange={e => setPreview(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grammar Brief (optional)
              </label>
              <textarea
                className="w-full border rounded p-2 h-20 text-sm"
                placeholder="Brief explanation of grammar patterns used..."
                value={grammarBrief}
                onChange={e => setGrammarBrief(e.target.value)}
              />
            </div>
            {/* Folder Selection */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📁 Save to Folder (optional)
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
              >
                <option value="">📂 No folder (root level)</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.type === 'auto' ? '🤖' : '📁'} {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between">
              <button 
                className="border px-2 py-1" 
                onClick={() => setMode('setup')}
              >
                ⟲ Back
              </button>
              <div className="space-x-2">
                <button 
                  className="border px-2 py-1" 
                  onClick={() => setEditOpen(true)}
                >
                  Edit Grammar
                </button>
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" 
                  onClick={save}
                  disabled={!preview.trim() || !topic.trim()}
                >
                  Save & Exit
                </button>
              </div>
            </div>
          </>
        )}

        {/* Deck Preview Mode - Show selected deck content and enhancement options */}
        {mode === 'deck-preview' && (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">Deck Overview: {topic}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Current Deck Content */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">📝 Current Content</h4>
                    <div className="text-sm space-y-2">
                      <div><strong>Phrases:</strong> {preview.split('\n').filter(Boolean).length}</div>
                      <div className="max-h-32 overflow-y-auto bg-white p-2 rounded border text-xs">
                        {preview.split('\n').filter(Boolean).map((line, i) => (
                          <div key={i} className="py-1">{line}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Current Metadata */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium mb-2">📊 Current Metadata</h4>
                    {(() => {
                      const selectedDeck = decks.find(d => d.id === selectedDeckId) as any;
                      const hasVocab = selectedDeck?.vocabulary && selectedDeck.vocabulary.length > 0;
                      const hasGrammar = selectedDeck?.grammarBrief && selectedDeck.grammarBrief.trim();
                      const difficulty = selectedDeck?.complexityLevel || 'Not specified';
                      
                      return (
                        <div className="text-sm space-y-1">
                          <div className={`${hasVocab ? 'text-green-600' : 'text-gray-500'}`}>
                            📖 Vocabulary: {hasVocab ? `${selectedDeck.vocabulary.length} words` : 'None'}
                          </div>
                          <div className={`${hasGrammar ? 'text-green-600' : 'text-gray-500'}`}>
                            📝 Grammar: {hasGrammar ? 'Available' : 'None'}
                          </div>
                          <div>💡 Difficulty: {difficulty}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Enhancement Options */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">🔧 Enhancement Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="enhancementType"
                      value="enrich"
                      checked={enhancementType === 'enrich'}
                      onChange={e => setEnhancementType(e.target.value as 'enrich' | 'difficulty')}
                      className="mr-3"
                    />
                    📚 Add/Improve Educational Content
                  </label>
                  
                  {enhancementType === 'enrich' && (
                    <div className="ml-6 mt-2 space-y-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={addVocabulary}
                          onChange={e => setAddVocabulary(e.target.checked)}
                          className="mr-2"
                        />
                        📖 Add/Improve Vocabulary (key words with definitions)
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={addGrammar}
                          onChange={e => setAddGrammar(e.target.checked)}
                          className="mr-2"
                        />
                        📝 Add/Improve Grammar (patterns and explanations)
                      </label>
                    </div>
                  )}
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="enhancementType"
                      value="difficulty"
                      checked={enhancementType === 'difficulty'}
                      onChange={e => setEnhancementType(e.target.value as 'enrich' | 'difficulty')}
                      className="mr-3"
                    />
                    📈 Create Difficulty Progression (Basic → Intermediate → Advanced)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button 
                className="border px-4 py-2 rounded" 
                onClick={() => setMode('setup')}
              >
                ⟲ Back to Selection
              </button>
              <button 
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50" 
                disabled={enhancementType === 'enrich' && !addVocabulary && !addGrammar} 
                onClick={enhanceDeck}
              >
                🚀 Start Enhancement
              </button>
            </div>
          </>
        )}

        {/* Preview Mode */}
        {mode === 'preview' && (
          <>
            <div className="grid grid-cols-1 gap-4">
              {/* Phrases Column */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Drill Phrases</h3>
                <blockquote className="border-l-4 border-blue-500 pl-3 italic whitespace-pre-line bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto">
                  {preview}
                </blockquote>
                {complexityLevel && (
                  <p className="text-sm bg-yellow-50 p-2 rounded">
                    <strong>Complexity:</strong> {complexityLevel}
                  </p>
                )}
              </div>
              
              {/* Grammar & Vocabulary Column */}
              <div className="space-y-4">
                {grammarBrief && (
                  <div>
                    <h3 className="font-semibold text-lg">Grammar</h3>
                    <div className="text-sm whitespace-pre-line bg-blue-50 p-4 rounded-lg border border-blue-200 max-h-32 overflow-y-auto">
                      {grammarBrief}
                    </div>
                  </div>
                )}
                {vocabulary.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg">Vocabulary</h3>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 max-h-40 overflow-y-auto">
                      <ul className="space-y-1 text-sm">
                        {vocabulary.map((v, i) => (
                          <li key={i} className="border-b border-green-200 pb-1 last:border-b-0">
                            <strong className="text-green-800">{v.word}:</strong> {v.definition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Folder Selection */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📁 Save to Folder (optional)
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
              >
                <option value="">📂 No folder (root level)</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.type === 'auto' ? '🤖' : '📁'} {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between">
              <button 
                className="border px-2 py-1" 
                onClick={() => setMode('setup')}
              >
                ⟲ Back
              </button>
              <div className="space-x-2">
                <button 
                  className="border px-2 py-1" 
                  onClick={() => setEditOpen(true)}
                >
                  Edit Grammar
                </button>
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" 
                  onClick={save}
                  disabled={!topic.trim()}
                >
                  Save & Exit
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <GrammarModal open={editOpen} text={grammarBrief} onSave={setGrammarBrief} onClose={() => setEditOpen(false)} />
    </div>
  );
}