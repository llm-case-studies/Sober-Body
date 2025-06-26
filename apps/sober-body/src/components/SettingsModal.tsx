import React, { useEffect, useState } from 'react'
import { useSettings } from '../features/core/settings-context'
export default function SettingsModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const { settings, setSettings } = useSettings()
  const [weight, setWeight] = useState(settings.weightKg)
  const [sex, setSex] = useState(settings.sex)
  const [beta, setBeta] = useState(settings.beta)
  useEffect(() => {
    if (open) {
      setWeight(settings.weightKg)
      setSex(settings.sex)
      setBeta(settings.beta)
    }
  }, [open, settings])
  const submit = () => {
    setSettings({ weightKg: weight, sex, beta })
    onClose()
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-4 w-72">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <label className="block mb-3 text-sm">
          Weight: {weight} kg
          <input
            type="range"
            min={40}
            max={150}
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="mb-3 flex gap-2 items-center">
          Sex:
          <button
            className={`px-2 py-1 border rounded ${sex === 'm' ? 'bg-blue-500 text-white' : ''}`}
            onClick={() => setSex('m')}
          >
            M
          </button>
          <button
            className={`px-2 py-1 border rounded ${sex === 'f' ? 'bg-pink-500 text-white' : ''}`}
            onClick={() => setSex('f')}
          >
            F
          </button>
        </div>
        <label className="block mb-4 text-sm">
          β: {beta.toFixed(3)}
          <input
            type="range"
            min={0.01}
            max={0.025}
            step={0.001}
            value={beta}
            onChange={e => setBeta(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="text-right">
          <button className="px-4 py-1 bg-blue-600 text-white rounded" onClick={submit}>Save</button>
        </div>
      </div>
    </div>
  )
}
