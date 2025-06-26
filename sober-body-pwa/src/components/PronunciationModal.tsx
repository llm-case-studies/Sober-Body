import PronunciationChallenge from '../features/games/PronunciationChallenge'

export default function PronunciationModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <PronunciationChallenge onClose={onClose} />
    </div>
  )
}
