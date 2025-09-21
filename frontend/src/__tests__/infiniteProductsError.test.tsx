import { describe, it, expect, vi } from 'vitest';
vi.mock('../services/products', () => ({ fetchProducts: vi.fn() }));
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import productReducer from '../store/productSlice';
import cartReducer from '../store/cartSlice';
import orderReducer from '../store/orderSlice';
import { useInfiniteProducts } from '../hooks/useInfiniteProducts';
import * as productService from '../services/products';

describe('useInfiniteProducts error handling', () => {
  it('sets error on 500 and stops loading', async () => {
    (productService.fetchProducts as any).mockRejectedValueOnce(new Error('Server error'));
    const store = configureStore({
      reducer: combineReducers({ auth: authReducer, products: productReducer, cart: cartReducer, orders: orderReducer }),
      preloadedState: { auth: { user: { id:1, username:'u', role:'buyer' }, accessToken:'t', status:'idle', error:null }, products:{ products:[], status:'idle', error:null }, cart:{ items:[] }, orders:{ orders:[], status:'idle', error:null, filters:{ page:1, page_size:20}, meta:{ count:0, next:null, previous:null } } }
    });
    const { result } = renderHook(() => useInfiniteProducts(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });
    // wait until either loading finished or error set to avoid race
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error).toBeTruthy();
  });
});
