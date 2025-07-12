// Mock Azure Speech package FIRST (before any imports)
vi.mock("../../azure-speech/src", () => ({
  useAzurePronunciation: vi.fn(),
  useAzureBudget: () => ({
    budgetExceeded: false,
    todaySpending: 0,
    remainingBudget: 3,
    addUsageEntry: vi.fn(),
    usageEntries: []
  })
}));

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
vi.mock("coach-ui", () => ({ PronunciationCoachUI: () => <h2>She sells seashells</h2> }));


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
        <MemoryRouter initialEntries={["/decks"]}>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </MemoryRouter>
      );
    });
    await screen.findByText(/Deck Manager \(beta\)/i, {}, { timeout: 5000 });
  });

  it("renders CoachPage at /pc/coach/:id", async () => {
    vi.mocked(useLiveQuery).mockReturnValue([
      { id: "test", title: "T", lang: "en", updatedAt: 0 },
      { id: "another", title: "Another Deck", lang: "es", updatedAt: 0 }
    ]);

    act(() => {
      render(
        <MemoryRouter initialEntries={["/coach/test"]}>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </MemoryRouter>
      );
    });
    await screen.findByRole('heading', { name: /She sells seashells/i, level: 2 }, { timeout: 5000 });
  });
});