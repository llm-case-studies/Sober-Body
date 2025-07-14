import { useState } from 'react';
import { LANGS } from '../../../../packages/pronunciation-coach/src/langs';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import openai from '../openai';
import { db } from '../db';
import GrammarModal from './GrammarModal';
import { toast } from '../toast';
import { useSettings } from '../features/core/settings-context';

export default function NewDrillWizard({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const { settings } = useSettings();
  const [step,setStep]=useState(1);
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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Get available folders for selection
  const folders = useLiveQuery(() => db().folders?.toArray() ?? [], [], []) || [];

  if(!open) return null;

  const generate=async()=>{
    setLoading(true);
    setShowManualEditOption(false); // Reset option on new generation attempt
    try{
      const res=await openai.chat.completions.create({
        model:'gpt-4o-mini',
        messages:[{
          role:'user',
          content:`Generate a JSON object for a pronunciation drill. The topic is "${topic}" in ${lang}. Include ${count} phrases, a brief grammar explanation, a list of key vocabulary words with definitions, and a complexity level (e.g., "Beginner", "Intermediate", "Advanced").
          
          JSON Structure:
          {
            "title": "[Deck Title]",
            "lang": "[Language Code, e.g., en-US]",
            "phrases": ["phrase1", "phrase2", ...],
            "grammarBrief": "[Brief grammar explanation]",
            "vocabulary": [{"word": "word1", "definition": "definition1"}],
            "complexityLevel": "[Complexity Level]"
          }`
        }],
        response_format: { type: "json_object" },
      });
      const content = res.choices[0].message.content || '';
      let parsedContent: any;
      try {
        // Attempt to parse directly
        parsedContent = JSON.parse(content);
      } catch (jsonError) {
        console.warn("Direct JSON parse failed, attempting markdown extraction:", jsonError);
        // Attempt to extract JSON from markdown code block
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedContent = JSON.parse(jsonMatch[1]);
          } catch (extractError) {
            console.error("JSON extraction from markdown failed:", extractError);
            toast.error("Failed to parse AI response. Invalid JSON format.");
            setShowManualEditOption(true);
            setLoading(false);
            return;
          }
        } else {
          console.error("No valid JSON or markdown JSON found:", content);
          toast.error("AI response not in expected JSON format.");
          setShowManualEditOption(true);
          setLoading(false);
          return;
        }
      }
      
      setPreview(parsedContent.phrases.join('\n'));
      setGrammarBrief(parsedContent.grammarBrief || '');
      setVocabulary(parsedContent.vocabulary || []);
      setComplexityLevel(parsedContent.complexityLevel || '');
      setStep(2);
    }catch(e: any){
      console.error("Error generating drill:", e);
      let errorMessage = "Failed to generate drill. Please try again.";
      if (e.message.includes("OpenAI API key is not configured")) {
        errorMessage = "OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your .env.local file.";
      } else if (e.message.includes("OpenAI API error")) {
        errorMessage = `OpenAI API error: ${e.message}. Please check your key or try again later.`;
      } else if (e.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your internet connection or try again later.";
      }
      toast.error(errorMessage);
      setShowManualEditOption(true);
    }finally{setLoading(false);}
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
        folderId: selectedFolderId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await db().decks.add(deckData);
      
      // Sync to disk if folder has diskPath
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-96 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">New Drill</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>
        {step===1 && (
          <>
            <input className="border w-full p-1" placeholder="Ordering food in Spain" value={topic} onChange={e=>setTopic(e.target.value)} />
            <input type="number" className="border w-full p-1" min={1} max={30} value={count} onChange={e=>setCount(Number(e.target.value))} />
            <select className="border w-full p-1" value={lang} onChange={e=>setLang(e.target.value)}>
              {LANGS.map(l=>(<option key={l.code} value={l.code}>{l.label}</option>))}
            </select>
            <div className="text-right space-x-2">
              <button className="border px-2" disabled={!topic || !import.meta.env.VITE_OPENAI_API_KEY} onClick={generate}>Next →</button>
              {showManualEditOption && (
                <button className="border px-2" onClick={handleManualEdit}>Edit Manually</button>
              )}
            </div>
          </>
        )}
        {step===2 && (
          <>
            {loading? (
              <div>Generating drill…</div>
            ):(
              <div className="space-y-2">
                <blockquote className="border-l-4 pl-3 italic whitespace-pre-line">{preview}</blockquote>
                {grammarBrief && (
                  <div>
                    <h3 className="font-semibold mt-2">Grammar:</h3>
                    <p className="text-sm whitespace-pre-line">{grammarBrief}</p>
                  </div>
                )}
                {vocabulary.length > 0 && (
                  <div>
                    <h3 className="font-semibold mt-2">Vocabulary:</h3>
                    <ul className="list-disc list-inside text-sm">
                      {vocabulary.map((v, i) => (
                        <li key={i}>{v.word}: {v.definition}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {complexityLevel && (
                  <p className="text-sm">Complexity: {complexityLevel}</p>
                )}
              </div>
            )}
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
              <button className="border px-2" onClick={()=>setStep(1)}>⟲ Back</button>
              <div className="space-x-2">
                <button className="border px-2" onClick={()=>setEditOpen(true)}>Edit Grammar</button>
                <button className="border px-2" onClick={save}>Save & Exit</button>
              </div>
            </div>
          </>
        )}
      </div>
      <GrammarModal open={editOpen} text={grammarBrief} onSave={setGrammarBrief} onClose={()=>setEditOpen(false)} />
    </div>
  );
}