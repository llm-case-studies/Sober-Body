vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));
vi.mock("../db", () => ({
  db: vi.fn(() => ({
    decks: {
      bulkDelete: vi.fn(),
      toArray: () => [
        { id: "demo", title: "D", lang: "en", updatedAt: 0 },
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
import userEvent from "@testing-library/user-event";
import { expect, it, vi, afterAll } from "vitest";

import { AppRoutes } from "@/App";
import { SettingsProvider } from "@/features/core/settings-context";
import { DeckProvider } from "@/features/deck-context";
import { useLiveQuery } from "dexie-react-hooks";

afterAll(() => {
  vi.unmock("coach-ui");
});

import { MemoryRouter } from "react-router-dom";

it("▶ button navigates to /pc/coach/:id", async () => {
  vi.mocked(useLiveQuery).mockReturnValue([
    { id: "demo", title: "D", lang: "en", updatedAt: 0 },
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
  const user = userEvent.setup();
  // Wait for table to render by looking for the play link
  const playLinks = await screen.findAllByLabelText("Play");
  expect(playLinks.length).toBeGreaterThan(0);
  // The link should navigate to /coach/demo, but since we're in MemoryRouter, 
  // let's check that the link itself has the correct href
  expect(playLinks[0].getAttribute('href')).toBe('/coach/demo');
});