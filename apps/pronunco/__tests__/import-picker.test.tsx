// 🔎 sanity-check
console.log('>>>> import-picker file evaluated. DEBUG_HANDLES =', process.env.DEBUG_HANDLES);
import { superTraceOpenHandles } from '../tests/helpers/super-trace-open-handles';
superTraceOpenHandles();

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Dexie from "dexie";

const nextTick = () => new Promise((r) => setTimeout(r, 0));
import DeckManager from "../src/components/DeckManager";
import { MemoryRouter } from "react-router-dom";
import { useFakeFilePicker } from "../tests/helpers/setup-fake-file-picker";

const importZip = vi.fn(async () => {});
const importFolder = vi.fn(async () => {});
const saveLastDir = vi.fn(async () => {});
const getLastDir = vi.fn(async () => undefined);

vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => [] }));
vi.mock("../../packages/core-storage/src/import-decks", () => ({
  importDeckZip: (...args: any[]) => importZip(...args),
  importDeckFolder: (...args: any[]) => importFolder(...args),
}));
vi.mock("../src/db", () => ({
  db: { decks: { toArray: vi.fn() } },
}));
vi.mock("../../packages/core-storage/src/ui-store", () => ({
  saveLastDir: (...args: any[]) => saveLastDir(...args),
  getLastDir: (...args: any[]) => getLastDir(...args),
}));


function setup() {
  render(
    <MemoryRouter>
      <DeckManager />
    </MemoryRouter>,
  );
}

// Setup fake timers and resolved file pickers
useFakeFilePicker();

describe("import pickers", () => {
  it("falls back to hidden input", async () => {
    console.log('▶ START: falls back to hidden input');
    setup();
    const user = userEvent.setup();
    const file = new File(["x"], "d.zip", { type: "application/zip" });
    await user.click(screen.getByText(/import zip/i));
    await vi.runOnlyPendingTimersAsync();
    await nextTick();
    const input = screen.getByTestId("zipInput") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await nextTick();
    expect(importZip).toHaveBeenCalledWith(file, expect.anything());
    expect(input.value).toBe("");
    console.log('✔ END:   falls back to hidden input');
  });

  it("uses showOpenFilePicker when available", async () => {
    console.log('▶ START: uses showOpenFilePicker when available');
    (window as any).showOpenFilePicker = vi.fn().mockResolvedValue([
      {
        kind: "file",
        name: "dummy.txt",
        getFile: vi.fn().mockResolvedValue(new File(["x"], "d.zip")),
      },
    ]);
    const order: string[] = [];
    saveLastDir.mockImplementation(async () => {
      order.push("save");
    });
    importZip.mockImplementation(async () => {
      order.push("import");
    });
    setup();
    const user = userEvent.setup();
    await user.click(screen.getByText(/import zip/i));
    await vi.runOnlyPendingTimersAsync();
    await nextTick();
    expect(window.showOpenFilePicker).toHaveBeenCalled();
    expect(importZip).toHaveBeenCalled();
    expect(saveLastDir).toHaveBeenCalled();
    expect(order).toEqual(["save", "import"]);
    console.log('✔ END:   uses showOpenFilePicker when available');
  });

  it("uses showOpenFilePicker for folders", async () => {
    console.log('▶ START: uses showOpenFilePicker for folders');
    const handles = [
      {
        kind: "file",
        name: "dummy.txt",
        getFile: vi
          .fn()
          .mockResolvedValue(new File(["{}"], "d.json", { type: "application/json" })),
      },
    ];
    (window as any).showOpenFilePicker = vi.fn().mockResolvedValue(handles);
    const start = { kind: "file" };
    getLastDir.mockResolvedValue(start as any);

    setup();
    const user = userEvent.setup();
    await user.click(screen.getByText(/import folder/i));
    await vi.runOnlyPendingTimersAsync();
    await nextTick();

    expect(window.showOpenFilePicker).toHaveBeenCalledWith(
      expect.objectContaining({ startIn: start, multiple: true }),
    );
    expect(importFolder).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
    );
    expect(saveLastDir).toHaveBeenCalledWith(handles[0], expect.anything());
    console.log('✔ END:   uses showOpenFilePicker for folders');
  });
});

