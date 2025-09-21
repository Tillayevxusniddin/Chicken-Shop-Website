import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProductCard from '../components/products/ProductCard';
import { ThemeProvider } from '@mui/material/styles';
import defaultTheme from '../theme';
import { renderWithAuth } from '../test-utils/renderWithStore';

// Mock localStorage for test environment (jsdom already provides but ensure isolation)
beforeEach(() => {
  const store: Record<string,string> = {};
  vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((k:string) => store[k] ?? null);
  vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation((k:string, v:string) => { store[k]=v; });
  vi.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation((k:string) => { delete store[k]; });
});

describe('ProductCard', () => {
  it('renders product name', () => {
    renderWithAuth(
      <ThemeProvider theme={defaultTheme}>
        <ProductCard product={{ id:1, name:'Leg', product_type:'leg', is_available:true, stock_kg:5, description:'', created_at:'', updated_at:'' } as any} />
      </ThemeProvider>,
      { role: 'buyer' }
    );
    expect(screen.getByText(/Leg/)).toBeInTheDocument();
  });
});
