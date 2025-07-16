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
  const handleDrillClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the whole card from being "clicked"
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
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div>
          <CardTitle className="text-lg">{deck.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{deck.language}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDrillClick}
          aria-label={`Start drill for ${deck.title}`}
        >
          {/* Using a simple play icon placeholder. Replace with an actual SVG icon component if available */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Button>
      </CardHeader>
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
