import { createContext, useContext } from "react";

// Temporary stub – just enough for CoachPage to mount.
export const DeckContext = createContext<any>(null);

export const DeckProvider = ({ children }: { children: React.ReactNode }) => (
  <DeckContext.Provider value={{}}>{children}</DeckContext.Provider>
);

export const useDeck = () => useContext(DeckContext);

export const useDecks = () => useContext(DeckContext);
