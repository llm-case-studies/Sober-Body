import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 space-y-6">
      <h1 className="text-4xl font-bold">Sober-Buddy</h1>
      <p className="text-lg">Party smart and wake up winning.</p>
      <ul className="text-left list-disc space-y-2">
        <li>One-tap drink logging</li>
        <li>Real-time BAC estimates</li>
        <li>Friendly guidance to stay safe</li>
      </ul>
      <Link to="/app" className="px-4 py-2 bg-blue-600 text-white rounded">Try the demo</Link>
    </div>
  )
}
