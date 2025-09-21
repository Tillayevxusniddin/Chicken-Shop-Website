import { describe, it, expect } from 'vitest';
import cartReducer, {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../store/cartSlice';

interface TestProduct {
  id: number;
  name: string;
  product_type: 'leg' | 'wing' | 'breast';
  description: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  stock_kg: number;
}
const baseState: { items: { product: TestProduct; quantity_kg: number }[] } = {
  items: [],
};
const product: TestProduct = {
  id: 1,
  name: 'Test',
  product_type: 'leg',
  description: '',
  is_available: true,
  created_at: '',
  updated_at: '',
  stock_kg: 25,
};

describe('cartSlice', () => {
  it('adds new product', () => {
    const next = cartReducer(baseState, addToCart(product));
    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity_kg).toBe(1);
  });
  it('increments existing product quantity', () => {
    const once = cartReducer(baseState, addToCart(product));
    const twice = cartReducer(once, addToCart(product));
    expect(twice.items[0].quantity_kg).toBe(2);
  });
  it('updates quantity', () => {
    const once = cartReducer(baseState, addToCart(product));
    const updated = cartReducer(
      once,
      updateQuantity({ productId: 1, quantity: 5 }),
    );
    expect(updated.items[0].quantity_kg).toBe(5);
  });
  it('removes product', () => {
    const once = cartReducer(baseState, addToCart(product));
    const removed = cartReducer(once, removeFromCart(1));
    expect(removed.items).toHaveLength(0);
  });
  it('clears cart', () => {
    const once = cartReducer(baseState, addToCart(product));
    const cleared = cartReducer(once, clearCart());
    expect(cleared.items).toHaveLength(0);
  });
});
