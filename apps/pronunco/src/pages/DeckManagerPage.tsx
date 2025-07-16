import React from 'react';
import { useIsMobile } from 'ui';
import DeckListMobile from '../components/DeckListMobile';
// import DeckListDesktop from './DeckListDesktop'; // Assuming this exists for desktop view

const DeckManagerPage = () => {
  const isMobile = useIsMobile();
  const decks = [ /* Fetch or define your mock deck data here */
    { id: '1', title: 'Spanish Basics', language: 'Spanish' },
    { id: '2', title: 'French Verbs', language: 'French' },
    { id: '3', title: 'Japanese Greetings', language: 'Japanese' },
  ];

  // Conditionally render the correct component based on the viewport
  return isMobile ? <DeckListMobile decks={decks} /> : <p>Desktop view coming soon!</p>; // Replace with DeckListDesktop
};

export default DeckManagerPage;
