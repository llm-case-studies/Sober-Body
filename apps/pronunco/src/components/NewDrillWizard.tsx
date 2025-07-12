import { useState } from 'react';
import { LANGS } from '../../../../packages/pronunciation-coach/src/langs';
import { useNavigate } from 'react-router-dom';
import openai from '../openai';
import { db } from '../db';
import GrammarModal from './GrammarModal';
import toast from '../toast';
import { useSettings } from '../features/core/settings-context';

export default function NewDrillWizard({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const { settings } = useSettings();
  const [step,setStep]=useState(1);
  const [topic,setTopic]=useState('');
  const [count,setCount]=useState(10);
  const [lang,setLang]=useState(settings.locale);
  const [preview,setPreview]=useState('');
  const [loading,setLoading]=useState(false);
  const [grammar,setGrammar]=useState('');
  const [editOpen,setEditOpen]=useState(false);
  const navigate=useNavigate();

  if(!open) return null;

  const generate=async()=>{
    setLoading(true);
    try{
      const res=await openai.chat.completions.create({
        model:'gpt-4o-mini',
        messages:[{role:'user',content:`${topic} (${lang}) ${count} lines`}]
      });
      const text=res.choices[0].message.content || '';
      setPreview(text);
      setStep(2);
    }finally{setLoading(false);}
  };

  const save=async()=>{
    const lines=preview.split('\n').filter(Boolean);
    const deckId=await db().decks.add({
      title: topic,
      type: 'pronun',
      lang,
      grammar,
      lines,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    navigate(`/pc/coach/${deckId}`);
    toast.success('Drill created 🎉');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-96 space-y-4">
        {step===1 && (
          <>
            <h2 className="font-semibold">New Drill</h2>
            <input className="border w-full p-1" placeholder="Ordering food in Spain" value={topic} onChange={e=>setTopic(e.target.value)} />
            <input type="number" className="border w-full p-1" min={1} max={30} value={count} onChange={e=>setCount(Number(e.target.value))} />
            <select className="border w-full p-1" value={lang} onChange={e=>setLang(e.target.value)}>
              {LANGS.map(l=>(<option key={l.code} value={l.code}>{l.label}</option>))}
            </select>
            <div className="text-right">
              <button className="border px-2" disabled={!topic} onClick={generate}>Next →</button>
            </div>
          </>
        )}
        {step===2 && (
          <>
            {loading? (
              <div>Generating drill…</div>
            ):(
              <blockquote className="border-l-4 pl-3 italic whitespace-pre-line">{preview}</blockquote>
            )}
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
      <GrammarModal open={editOpen} text={grammar} onSave={setGrammar} onClose={()=>setEditOpen(false)} />
    </div>
  );
}
