import { useState } from 'react'

export default function CategoryInput({
  value,
  setValue,
  options,
}: {
  value: string[]
  setValue: (v: string[]) => void
  options: string[]
}) {
  const [draft, setDraft] = useState('')
  const toggle = (cat: string) => {
    setValue(value.includes(cat) ? value.filter(c => c !== cat) : [...value, cat])
  }
  const add = () => {
    const val = draft.trim().toLowerCase()
    if (!val) return
    const tag = val.startsWith('cat:') ? val : `cat:${val}`
    if (!value.includes(tag)) setValue([...value, tag])
    setDraft('')
  }
  return (
    <>
      <div className="flex flex-wrap gap-1 mb-1">
        {options.map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`px-2 py-0.5 rounded-full text-xs ${value.includes(cat) ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
          >
            {cat.slice(4)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 border p-2 rounded">
        {value.filter(c => !options.includes(c)).map(cat => (
          <span key={cat} className="bg-sky-100 px-2 py-0.5 rounded-full text-xs">
            {cat.slice(4)}{' '}
            <button onClick={() => setValue(value.filter(c => c !== cat))} aria-label="Remove category">×</button>
          </span>
        ))}
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            } else if (e.key === 'Backspace' && draft === '') {
              setValue(value.slice(0, -1))
            }
          }}
          placeholder="Add category"
          className="flex-1 min-w-[6rem] text-xs focus:outline-none"
        />
      </div>
    </>
  )
}
