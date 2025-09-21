import { describe, it, expect } from 'vitest';
import { renderWithAuth } from '../test-utils/renderWithStore';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { ColorModeProvider } from '../components/common/ColorModeContext';
import { screen, fireEvent } from '@testing-library/react';

const product = { id: 77, name: 'Persist', product_type: 'leg', is_available: true, description: '', created_at: '', updated_at: '', stock_kg: 12 } as any;

describe('Cart persistence', () => {
  it('hydrates from localStorage', () => {
    localStorage.setItem('cartItems', JSON.stringify([{ product, quantity_kg: 3 }]));
    const { store: testStore } = renderWithAuth(<MemoryRouter><div>Hydrate</div></MemoryRouter>);
    expect(testStore.getState().cart.items[0].quantity_kg).toBe(3);
  });
  it('persists after adding', () => {
    localStorage.clear();
    const { store: s } = renderWithAuth(<ColorModeProvider><MemoryRouter><ProductCard product={product} /></MemoryRouter></ColorModeProvider>);
    fireEvent.click(screen.getByText('Savatga'));
    const stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
    expect(stored[0].quantity_kg).toBe(1);
    expect(s.getState().cart.items[0].quantity_kg).toBe(1);
  });
});
