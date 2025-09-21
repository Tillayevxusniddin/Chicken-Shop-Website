// src/theme.ts

import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    gradient: {
      primary: string;
      subtle: string;
      glass: string;
    };
    surface: {
      level0: string;
      level1: string;
      level2: string;
    };
  }
  interface PaletteOptions {
    gradient?: Palette['gradient'];
    surface?: Palette['surface'];
  }
}

const common: ThemeOptions = {
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-1.5px' },
    h2: { fontWeight: 700, letterSpacing: '-1px' },
    h3: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '.3px' },
    subtitle1: { fontWeight: 500 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: ({ palette }) => ({
        body: {
          background:
            palette.mode === 'dark'
              ? 'radial-gradient(circle at 30% 20%,#1f1a11,#12100c)'
              : 'radial-gradient(circle at 30% 20%,#fff8e6,#fff)',
          transition: 'background .6s ease',
        },
        '::-webkit-scrollbar': { width: 10 },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': {
          background: alpha('#8d6e63', 0.35),
          borderRadius: 20,
        },
      }),
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 600,
          position: 'relative',
          overflow: 'hidden',
          '&:after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(120deg,rgba(255,255,255,.15),rgba(255,255,255,0))',
            opacity: 0,
            transition: 'opacity .3s ease',
          },
          '&:hover:after': { opacity: 1 },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg,#ffb300,#ff6f00)',
          color: '#1d1300',
          '&:hover': { background: 'linear-gradient(135deg,#ffc107,#ff8f00)' },
        },
        outlined: {
          borderColor: alpha('#ff6f00', 0.4),
          background:
            'linear-gradient(135deg,rgba(255,193,7,.12),rgba(255,111,0,.04))',
          '&:hover': {
            background:
              'linear-gradient(135deg,rgba(255,193,7,.2),rgba(255,111,0,.08))',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(30,22,10,0.65)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'background-color .4s ease, color .4s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 24,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(160deg,rgba(255,193,7,.08),rgba(255,111,0,.05) 60%,rgba(255,255,255,.05))'
              : 'linear-gradient(160deg,#ffffff,#fffaf2 60%,#fff2d9)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 18px -4px rgba(0,0,0,.6)'
              : '0 4px 18px -4px rgba(0,0,0,.15)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform .35s ease, box-shadow .35s ease',
          '&:before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 15%,rgba(255,255,255,.4),transparent 70%)',
            opacity: 0.35,
            pointerEvents: 'none',
          },
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 10px 28px -6px rgba(0,0,0,.75)'
                : '0 10px 28px -6px rgba(0,0,0,.25)',
          },
        }),
      },
    },
    MuiContainer: {
      styleOverrides: { root: { paddingTop: 24, paddingBottom: 40 } },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          background:
            theme.palette.mode === 'dark'
              ? alpha('#ffb300', 0.15)
              : alpha('#ff6f00', 0.12),
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          '& fieldset': { borderRadius: 14 },
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,.06)'
              : 'rgba(0,0,0,.04)',
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg,rgba(255,193,7,.08),rgba(255,111,0,.1))'
              : 'linear-gradient(90deg,#fff3d4,#ffe8ba)',
        }),
      },
    },
  },
};

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#ffb300', contrastText: '#281a00' },
      secondary: { main: '#ff6f00', contrastText: '#ffffff' },
      background:
        mode === 'dark'
          ? { default: '#14110c', paper: '#1c1812' }
          : { default: '#fffdf9', paper: '#ffffff' },
      gradient: {
        primary: 'linear-gradient(135deg,#ffb300,#ff6f00)',
        subtle:
          mode === 'dark'
            ? 'linear-gradient(145deg,#1f1a14,#15130f)'
            : 'linear-gradient(145deg,#ffffff,#fff7e3)',
        glass:
          'linear-gradient(135deg,rgba(255,193,7,.25),rgba(255,111,0,.15))',
      },
      surface: {
        level0: mode === 'dark' ? '#14110c' : '#fffdf9',
        level1: mode === 'dark' ? '#1c1812' : '#ffffff',
        level2: mode === 'dark' ? '#262017' : '#fff7e3',
      },
    },
    // Must be exactly length 25 per MUI type (index 0..24)
    shadows: (() => {
      const arr: string[] = ['none'];
      for (let i = 0; i < 24; i++) {
        const spread = 4 + i;
        const alpha = mode === 'dark' ? 0.55 : 0.18;
        arr.push(`0 2px ${spread}px -2px rgba(0,0,0,${alpha})`);
      }
      return arr as unknown as import('@mui/material/styles').Shadows;
    })(),
    ...common,
  });

// Default export a light theme for initial non-context usage
const defaultTheme = buildTheme('light');
export default defaultTheme;
