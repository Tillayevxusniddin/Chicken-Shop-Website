import { describe, it, expect } from 'vitest';
import { ColorModeProvider, useColorMode } from '../components/common/ColorModeContext';
import { render, screen, fireEvent } from '@testing-library/react';

const ToggleProbe = () => {
  const { mode, toggle } = useColorMode();
  return <button onClick={toggle}>mode:{mode}</button>;
};

describe('Color mode persistence', () => {
  it('toggles and persists to localStorage', () => {
    localStorage.clear();
    const { unmount } = render(<ColorModeProvider><ToggleProbe /></ColorModeProvider>);
    const btn = screen.getByText(/mode:/);
    const first = btn.textContent;
    fireEvent.click(btn);
    const second = btn.textContent;
    expect(first).not.toEqual(second);
    unmount();
    // Re-mount should read stored value (second)
    render(<ColorModeProvider><ToggleProbe /></ColorModeProvider>);
    expect(screen.getByText(/mode:/).textContent).toEqual(second);
  });
});
