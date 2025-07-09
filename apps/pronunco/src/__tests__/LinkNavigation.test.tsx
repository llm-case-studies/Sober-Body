/// <reference types="vitest" />
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi, afterAll } from "vitest";
import App from "@/App";
import { SettingsProvider } from "@/features/core/settings-context";
import { DeckProvider } from "@/features/deck-context";

const deck = { id: "demo", title: "D", lang: "en", updatedAt: 0 };
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => [deck] }));
vi.mock("../db", () => ({ db: {} }));
vi.mock("coach-ui", () => ({ PronunciationCoachUI: () => <div>Dummy deck</div> }));

afterAll(() => {
  vi.unmock("coach-ui");
});

it("▶ button navigates to /pc/coach/:id", async () => {
  window.history.pushState({}, "", "/pc/decks");
  render(
    <SettingsProvider>
      <DeckProvider deckId="demo">
        <App />
      </DeckProvider>
    </SettingsProvider>
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("link", { name: /play deck/i }));
  expect(window.location.pathname).toMatch(/^\/pc\/coach\/.+/);
});
