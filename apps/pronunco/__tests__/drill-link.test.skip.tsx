import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DrillLink from '../src/components/DrillLink';

const deck = { id: 'abc123', title: 'Deck', lang: 'en', lines: [], tags: [] };

describe('DrillLink', () => {
  it('renders link to drill page', () => {
    render(
      <MemoryRouter>
        <DrillLink deck={deck} />
      </MemoryRouter>
    );
    const link = screen.getByText("Drill");
    expect(link.getAttribute('href')).toBe('/pc/drill/abc123');
  });
});
