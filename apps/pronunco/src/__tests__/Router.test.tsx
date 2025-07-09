// @vitest-environment jsdom
/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterAll } from "vitest";

const deck = { id: "test", title: "T", lang: "en", updatedAt: 0 };
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => [deck] }));
vi.mock("../db", () => ({ db: {} }));
vi.mock("coach-ui", () => ({ PronunciationCoachUI: () => <div>Dummy deck</div> }));

import App from "@/App";
import { SettingsProvider } from "@/features/core/settings-context";
import { DeckProvider } from "@/features/deck-context";

afterAll(() => {
  vi.unmock("coach-ui");
});

describe("PronunCo routes", () => {
  it("renders DeckManager at /pc/decks", async () => {
    window.history.pushState({}, "", "/pc/decks");
    render(
      <SettingsProvider>
        <DeckProvider deckId="demo">
          <App />
        </DeckProvider>
      </SettingsProvider>
    );
    await screen.findByText(/deck manager/i);
  });

  it("renders CoachPage at /pc/coach/:id", async () => {
    window.history.pushState({}, "", "/pc/coach/test");
    render(
      <SettingsProvider>
        <DeckProvider deckId="test">
          <App />
        </DeckProvider>
      </SettingsProvider>
    );
    await screen.findByText(/dummy deck/i);
  });
});
