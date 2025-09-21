import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { buildTheme } from '../../theme';

interface ColorModeContextValue {
  mode: 'light' | 'dark';
  toggle: () => void;
  setMode: (m: 'light' | 'dark') => void;
}

export const ColorModeContext = React.createContext<ColorModeContextValue | undefined>(undefined);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ui-mode');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggle = React.useCallback(() => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ui-mode', mode);
      document.documentElement.dataset.colorMode = mode;
    }
  }, [mode]);

  const theme = React.useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggle, setMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => {
  const ctx = React.useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used within ColorModeProvider');
  return ctx;
};
