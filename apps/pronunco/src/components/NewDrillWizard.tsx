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

type WizardMode = 'setup' | 'generating' | 'preview' | 'offline' | 'paywall' | 'manual' | 'text-analysis';

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

  // Get available folders for selection
  const folders = useLiveQuery(() => db().folders?.toArray() ?? [], [], []) || [];

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

        {/* Preview Mode */}
        {mode === 'preview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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