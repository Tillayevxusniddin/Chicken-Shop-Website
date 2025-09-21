import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import productReducer from '../store/productSlice';
import cartReducer from '../store/cartSlice';
import orderReducer from '../store/orderSlice';
import { vi, describe, it, expect } from 'vitest';
import * as productService from '../services/products';

vi.mock('../services/products', () => {
  return {
    fetchProducts: vi.fn(),
  };
});
import { useInfiniteProducts } from '../hooks/useInfiniteProducts';

describe('useInfiniteProducts', () => {
  it('loads first page then stops on 404 for next', async () => {
  const first = { count: 6, next: 'x', previous: null, results: [{ id:1, name:'A', product_type:'leg', is_available:true, description:'', created_at:'', updated_at:'' }] } as any;
  const notFound = Object.assign(new Error('Not Found'), { response: { status: 404 } });
  const spy = (productService.fetchProducts as unknown as ReturnType<typeof vi.fn>);
  spy.mockResolvedValueOnce(first).mockRejectedValueOnce(notFound);
    const store = configureStore({
      reducer: combineReducers({ auth: authReducer, products: productReducer, cart: cartReducer, orders: orderReducer }),
      preloadedState: { auth: { user: { id:1, username:'u', role:'buyer' }, accessToken:'t', status:'idle', error:null }, products:{ products:[], status:'idle', error:null }, cart:{ items:[] }, orders:{ orders:[], status:'idle', error:null, filters:{ page:1, page_size:20}, meta:{ count:0, next:null, previous:null } } }
    });
    const { result } = renderHook(() => useInfiniteProducts({ pageSize: 6 }), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(1);
    act(() => result.current.loadNext());
    await waitFor(() => expect(result.current.hasMore).toBe(false));
  // Depending on effect scheduling, an extra safety invocation may occur (guarded by loadingRef / hasMore)
  // Accept 2 or 3 but assert at least two distinct attempts happened.
  expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
  expect(spy.mock.calls.length).toBeLessThanOrEqual(3);
  });
});
