import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function LandingPage() {
  const burst = () => {
    confetti({ particleCount: 80, spread: 60 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-600 text-white flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold tracking-tight text-center"
      >
        🎉 Sober-Buddy
      </motion.h1>

      <p className="mt-4 text-xl text-center max-w-md">
        Party smart tonight, own your morning tomorrow.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { emoji: '🖱️', title: '1-tap logging', desc: 'Log a drink in under a second.' },
          { emoji: '📈', title: 'Live BAC', desc: 'See your level adjust in real time.' },
          { emoji: '🤝', title: 'Group mode', desc: 'Look out for your crew (beta).' },
        ].map((f) => (
          <motion.div
            key={f.title}
            whileHover={{ y: -4 }}
            className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center"
          >
            <div className="text-3xl">{f.emoji}</div>
            <h3 className="mt-2 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-white/80">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex gap-4">
        <a
          href="/app"
          onClick={burst}
          className="px-6 py-3 rounded-full bg-white text-fuchsia-700 font-semibold shadow-md hover:scale-105 transition-transform"
        >
          Try the Demo
        </a>
        <a
          href="mailto:beta@isoberbuddy.com"
          className="px-6 py-3 rounded-full border border-white font-semibold hover:bg-white/10 transition-colors"
        >
          Join the Beta
        </a>
      </div>
    </div>
  )
}
