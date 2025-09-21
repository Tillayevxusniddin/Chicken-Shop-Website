import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import productReducer from '../store/productSlice';
import cartReducer from '../store/cartSlice';
import orderReducer from '../store/orderSlice';
import { useInfiniteProducts } from '../hooks/useInfiniteProducts';
import * as productService from '../services/products';

vi.mock('../services/products', () => ({
  fetchProducts: vi.fn(),
}));

describe('useInfiniteProducts append & stop', () => {
  it('appends second page then stops when next null', async () => {
    const first = { count: 4, next: 'x', previous: null, results: [ { id:1, name:'A', product_type:'leg', is_available:true, description:'', created_at:'', updated_at:'' } ] } as any;
    const second = { count: 4, next: null, previous: 'x', results: [ { id:2, name:'B', product_type:'wing', is_available:true, description:'', created_at:'', updated_at:'' } ] } as any;
    const spy = productService.fetchProducts as unknown as ReturnType<typeof vi.fn>;
    spy.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const store = configureStore({
      reducer: combineReducers({ auth: authReducer, products: productReducer, cart: cartReducer, orders: orderReducer }),
      preloadedState: { auth: { user: { id:1, username:'u', role:'buyer' }, accessToken:'t', status:'idle', error:null }, products:{ products:[], status:'idle', error:null }, cart:{ items:[] }, orders:{ orders:[], status:'idle', error:null, filters:{ page:1, page_size:20}, meta:{ count:0, next:null, previous:null } } }
    });
    const { result } = renderHook(() => useInfiniteProducts({ pageSize: 1 }), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.loadNext());
    await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.products.map((p: any)=>p.id)).toEqual([1,2]);
    // Try another next -> should not call fetch again because hasMore false
    const callCount = spy.mock.calls.length;
    act(() => result.current.loadNext());
    await new Promise(r=>setTimeout(r,10));
    expect(spy.mock.calls.length).toBe(callCount);
  });
});
