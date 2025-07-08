import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingsProvider, useSettings } from '../../../apps/sober-body/src/features/core/settings-context';

describe('settings context', () => {
  it('updates language in settings context', () => {
    const wrapper = ({ children }: any) => <SettingsProvider>{children}</SettingsProvider>;
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setSettings(s => ({ ...s, locale: 'es' })));
    expect(result.current.settings.locale).toBe('es');
  });
});
