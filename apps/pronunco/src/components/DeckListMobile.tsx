import React from 'react';
import { useDecks } from '../../../sober-body/src/features/games/deck-context';
import { Link } from 'react-router-dom';

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white shadow-md rounded-lg p-4 mb-4">{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="font-bold text-lg mb-2">{children}</div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const CardFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 flex justify-end">{children}</div>
);

export default function DeckListMobile() {
  const { decks } = useDecks();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Decks</h2>
      {decks.map((deck) => (
        <Card key={deck.id}>
          <CardHeader>{deck.title}</CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{deck.lang}</p>
          </CardContent>
          <CardFooter>
            <Link
              to={`../coach/${deck.id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors"
            >
              ▶ Play
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}