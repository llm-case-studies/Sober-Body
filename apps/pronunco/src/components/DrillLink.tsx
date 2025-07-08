import { Link } from 'react-router-dom';
import type { Deck } from '../../../../apps/sober-body/src/features/games/deck-types';

export default function DrillLink({ deck }: { deck: Deck }) {
  return (
    <Link to={`/pc/drill/${deck.id}`} aria-label="Drill deck">
      Drill
    </Link>
  );
}
