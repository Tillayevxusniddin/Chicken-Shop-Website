import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { screen, fireEvent } from '@testing-library/react';
import { ColorModeProvider } from '../components/common/ColorModeContext';
import { renderWithAuth } from '../test-utils/renderWithStore';

const baseProduct = { id: 11, name: 'Card Test', product_type: 'leg', description:'', is_available:true, stock_kg:2, created_at:'', updated_at:'' } as const;

describe('ProductCard interaction', () => {
  it('adds item to cart on button click', () => {
    const { store } = renderWithAuth(
      <ColorModeProvider>
        <MemoryRouter>
          <ProductCard product={baseProduct as any} />
        </MemoryRouter>
      </ColorModeProvider>,
      { role: 'buyer' }
    );
    const btn = screen.getByText('Savatga');
    fireEvent.click(btn);
    const state = store.getState();
    expect(state.cart.items.length).toBe(1);
    expect(state.cart.items[0].product.id).toBe(11);
  });
});
