import fs from 'node:fs/promises'
import path from 'node:path'

export async function samplePresetDecks(n = 5): Promise<string[]> {
  const dir = path.join(__dirname, '..', '..', 'sober-body', 'src', 'presets')
  const all = (await fs.readdir(dir)).filter(f => f.endsWith('.json'))
  return all
    .sort(() => 0.5 - Math.random())
    .slice(0, n)
    .map(f => path.join(dir, f))
}
