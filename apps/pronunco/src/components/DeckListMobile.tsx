import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from 'ui';

// Define the shape of a single deck object (adjust based on actual data structure)
interface Deck {
  id: string;
  title: string;
  language: string;
}

interface DeckListMobileProps {
  decks: Deck[];
}

interface DeckCardProps {
  deck: Deck;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck }) => {
  const navigate = useNavigate();
  
  // Handler for the drill button
  const handleDrillClick = () => {
    navigate(`/m/coach/${deck.id}`);
  };

  // Handler for a long press (for multi-select)
  const handleLongPress = () => {
    console.log(`Long press on deck: ${deck.title}`);
    // TODO: Implement multi-select logic
  };

  return (
    <Card
      className="w-full transition-transform transform active:scale-95"
      onTouchStart={handleLongPress} // Simple long-press placeholder
      onContextMenu={(e) => e.preventDefault()} // Prevents context menu on long press
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{deck.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{deck.language}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Button
          onClick={handleDrillClick}
          className="w-full h-11 text-base font-medium"
          aria-label={`Start practice with ${deck.title}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Practice
        </Button>
      </CardContent>
    </Card>
  );
};

const DeckListMobile: React.FC<DeckListMobileProps> = ({ decks }) => {
  if (!decks || decks.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No decks found. Create one to get started!</p>;
  }

  return (
    <div className="p-4 space-y-4">
      {decks.map((deck) => (
        // We will build the DeckCard component next
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
};

export default DeckListMobile;
