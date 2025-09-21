import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../../store/authSlice';
import cartReducer from '../../../store/cartSlice';

const baseProduct = {
  id: 1,
  name: 'Test Chicken',
  product_type: 'leg',
  description: 'Desc',
  is_available: true,
  stock_kg: 12.5,
  image: null as any
};

const rootReducer = combineReducers({ auth: authReducer as any, cart: cartReducer as any });

function renderWithStore(userRole: 'buyer' | 'seller' | null) {
  const preloadedState: any = { auth: { user: userRole ? { role: userRole } : null }, cart: { items: [] } };
  const store = configureStore({ reducer: rootReducer, preloadedState });
  return render(
    <Provider store={store}>
      <ProductCard product={baseProduct as any} />
    </Provider>
  );
}

describe('ProductCard role UI', () => {
  test('shows add buttons for buyer', () => {
    renderWithStore('buyer');
    expect(screen.getAllByRole('button', { name: /Savatga|Qo'shish/ }).length).toBeGreaterThan(0);
  });

  test('hides add buttons for seller', () => {
    renderWithStore('seller');
    expect(screen.queryByRole('button', { name: /Savatga/ })).toBeNull();
  });

  test('disables add button when out of stock', () => {
    const product = { ...baseProduct, stock_kg: 0, is_available: true };
  const preloadedState: any = { auth: { user: { role: 'buyer' } }, cart: { items: [] } };
  const store = configureStore({ reducer: rootReducer, preloadedState });
    render(
      <Provider store={store}>
        <ProductCard product={product as any} />
      </Provider>
    );
    const btn = screen.getByRole('button', { name: /Savatga/ });
    expect(btn).toBeDisabled();
  });
});