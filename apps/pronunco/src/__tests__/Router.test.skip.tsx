vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));
vi.mock("../db", () => ({
  db: vi.fn(() => ({
    decks: {
      bulkDelete: vi.fn(),
      toArray: () => [
        { id: "test", title: "T", lang: "en", updatedAt: 0 },
        { id: "another", title: "Another Deck", lang: "es", updatedAt: 0 }
      ],
    },
    transaction: vi.fn((mode, stores, fn) => fn()),
  })),
}));
vi.mock("coach-ui", () => ({ PronunciationCoachUI: () => <div>Dummy deck</div> }));


// @vitest-environment jsdom
/// <reference types="vitest" />
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, afterAll } from "vitest";

import { AppRoutes } from "@/App";
import { SettingsProvider } from "@/features/core/settings-context";
import { DeckProvider } from "@/features/deck-context";
import { useLiveQuery } from "dexie-react-hooks";

afterAll(() => {
  vi.unmock("coach-ui");
});

import { MemoryRouter } from "react-router-dom";

describe("PronunCo routes", () => {
  it("renders DeckManager at /pc/decks", async () => {
    vi.mocked(useLiveQuery).mockReturnValue([
      { id: "test", title: "T", lang: "en", updatedAt: 0 },
      { id: "another", title: "Another Deck", lang: "es", updatedAt: 0 }
    ]);

    act(() => {
      render(
        <MemoryRouter initialEntries={["/pc/decks"]}>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </MemoryRouter>
      );
    });
    await screen.findByText(/Mocked DeckManager/i, {}, { timeout: 5000 });
    console.log(document.body.innerHTML);
  });

  it("renders CoachPage at /pc/coach/:id", async () => {
    vi.mocked(useLiveQuery).mockReturnValue([
      { id: "test", title: "T", lang: "en", updatedAt: 0 },
      { id: "another", title: "Another Deck", lang: "es", updatedAt: 0 }
    ]);

    act(() => {
      render(
        <MemoryRouter initialEntries={["/pc/coach/test"]}>
          <SettingsProvider>
            <DeckProvider deckId="test">
              <AppRoutes />
            </DeckProvider>
          </SettingsProvider>
        </MemoryRouter>
      );
    });
    await screen.findByText(/dummy deck/i, {}, { timeout: 5000 });
    console.log(document.body.innerHTML);
  });
});