import { useState, useEffect } from 'react';

export default function GrammarModal({ open, text, onSave, onClose }:{ open:boolean; text:string; onSave:(t:string)=>void; onClose:()=>void }) {
  const [val,setVal] = useState(text);
  useEffect(()=>{ if(open) setVal(text); },[open,text]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-96 space-y-2">
        <textarea className="border w-full h-40 p-1" value={val} onChange={e=>setVal(e.target.value)} />
        <div className="text-right space-x-2">
          <button className="border px-2" onClick={onClose}>Cancel</button>
          <button className="border px-2" onClick={()=>{onSave(val);onClose();}}>Save</button>
        </div>
      </div>
    </div>
  );
}
