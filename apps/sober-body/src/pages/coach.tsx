import { Link } from 'react-router-dom'

export default function CoachPage() {
  return (
    <div className="p-4">
      <Link to="/pc/coach" className="border rounded p-4 block max-w-sm mx-auto text-center">
        Practice decks in PronunCo ➜
      </Link>
    </div>
  )
}
