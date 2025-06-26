import React from 'react'
import { useDrinkLog } from '../features/core/drink-context'

export default function DrinkButtons() {
  const { addDrink } = useDrinkLog()

  const now = () => new Date()
  return (
    <div>
      <button aria-label="add beer" onClick={() => addDrink({ volumeMl: 330, abv: 0.05, date: now() })}>
        Beer 🍺
      </button>
      <button aria-label="add wine" onClick={() => addDrink({ volumeMl: 150, abv: 0.12, date: now() })}>
        Wine 🍷
      </button>
      <button aria-label="add shot" onClick={() => addDrink({ volumeMl: 45, abv: 0.4, date: now() })}>
        Shot 🥃
      </button>
    </div>
  )
}
