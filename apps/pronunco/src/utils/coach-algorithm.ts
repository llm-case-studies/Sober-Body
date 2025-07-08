export interface CardStat {
  id: number;
  attempts: number;
  correct: number;
}

export function pickNextCard(deck: CardStat[]): CardStat {
  return deck.reduce((lowest, card) => {
    const acc = card.attempts ? card.correct / card.attempts : 0;
    const lowAcc = lowest.attempts ? lowest.correct / lowest.attempts : 1;
    return acc < lowAcc ? card : lowest;
  }, deck[0]);
}
