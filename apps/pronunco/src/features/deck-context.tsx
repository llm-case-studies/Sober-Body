import { createContext, useContext, useState } from "react";

type Card = { front: string; back: string };
type Deck = { id: string; title: string; cards: Card[]; lines?: string[] };

type DeckCtx = {
  deck: Deck;
  current: number;
  next(): void;
  prev(): void;
  speak(text: string): void;
  listen(cb: (text: string) => void): void;
};

export const DeckContext = createContext<DeckCtx | null>(null);

export function DeckProvider({
  deckId,
  children,
}: {
  deckId: string;
  children: React.ReactNode;
}) {
  const dummy: Deck = {
    id: deckId,
    title: "Dummy deck",
    cards: [
      { front: "Hola", back: "Hello" },
      { front: "Adiós", back: "Good-bye" },
    ],
    lines: ["Hola", "Adiós"],
  };

  const [idx, setIdx] = useState(0);

  const value: DeckCtx = {
    deck: dummy,
    current: idx,
    next: () => setIdx((i) => (i + 1) % dummy.cards.length),
    prev: () => setIdx((i) => (i - 1 + dummy.cards.length) % dummy.cards.length),
    speak: () => {
      /* no-op */
    },
    listen: () => {
      /* no-op */
    },
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeck must be inside DeckProvider");
  return ctx;
}

export function useDecks() {
  const ctx = useDeck();
  return { decks: [ctx.deck], activeDeck: ctx.deck.id, setActiveDeck: () => {} };
}
