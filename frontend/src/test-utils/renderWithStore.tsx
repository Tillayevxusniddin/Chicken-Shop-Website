import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import cartReducer from '../store/cartSlice';
import productReducer from '../store/productSlice';
import orderReducer from '../store/orderSlice';
import { render } from '@testing-library/react';

interface Options {
  role?: 'buyer' | 'seller';
  username?: string;
  accessToken?: string | null;
}

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  products: productReducer,
  orders: orderReducer,
});

export type TestRootState = ReturnType<typeof rootReducer>;

export function renderWithAuth(ui: React.ReactElement, opts: Options = {}) {
  const { role = 'buyer', username = 'testuser', accessToken = 'token123' } = opts;
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      auth: {
        user: accessToken
          ? { id: 1, username, role }
          : null,
        accessToken,
        status: 'idle',
        error: null,
      },
      cart: {
        items: (() => {
          try {
            const raw = localStorage.getItem('cartItems');
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        })(),
      },
      products: { products: [], status: 'idle', error: null },
      orders: {
        orders: [],
        status: 'idle',
        error: null,
        filters: { page: 1, page_size: 20 },
        meta: { count: 0, next: null, previous: null },
      },
    },
  });
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

export default renderWithAuth;