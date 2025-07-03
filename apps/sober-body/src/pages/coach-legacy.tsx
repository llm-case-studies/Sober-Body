import { useSearchParams, Navigate } from 'react-router-dom'

export default function CoachLegacy() {
  const [params] = useSearchParams()
  const id = params.get('deck')
  if (id) return <Navigate to={`/coach/deck/${encodeURIComponent(id)}`} replace />
  return <Navigate to="/decks" replace />
}
