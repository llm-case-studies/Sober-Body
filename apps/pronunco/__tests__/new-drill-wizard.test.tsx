import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NewDrillWizard from '../src/components/NewDrillWizard';
import { SettingsProvider } from '../src/features/core/settings-context';

vi.mock('../src/openai', () => ({
  default: { chat: { completions: { create: vi.fn(async () => ({ choices: [{ message: { content: 'a\nb\nc' } }] })) } } }
}));

const add = vi.fn(async (d:any)=>'1');
vi.mock('../src/db', () => ({ db: () => ({ decks: { add } }) }));
vi.mock('../src/toast', () => ({ default: { success: vi.fn() } }));

const renderWizard = () =>
  render(
    <MemoryRouter>
      <SettingsProvider>
        <NewDrillWizard open onClose={() => {}} />
      </SettingsProvider>
    </MemoryRouter>
  );

describe('NewDrillWizard', () => {
  it('next disabled until topic entered', async () => {
    renderWizard();
    const next = screen.getByRole('button', { name: /next/i });
    expect((next as HTMLButtonElement).disabled).toBe(true);
    await userEvent.type(screen.getByPlaceholderText(/ordering food/i), 'Hi');
    expect((next as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows preview from openai and saves deck', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.type(screen.getByPlaceholderText(/ordering food/i), 'topic');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await screen.findByRole('button', { name: /save & exit/i });
    await user.click(screen.getByRole('button', { name: /save & exit/i }));
    expect(add).toHaveBeenCalled();
    const row = add.mock.calls[0][0];
    expect(row.lines.length).toBe(3);
  });
});
