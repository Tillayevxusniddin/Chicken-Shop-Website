// src/store/orderSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import type { Order } from '../types/order';
import type { RootState } from './index';

interface OrderState {
  orders: Order[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    status?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    page: number;
    page_size: number;
  };
  meta: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

const initialState: OrderState = {
  orders: [],
  status: 'idle',
  error: null,
  filters: { page: 1, page_size: 20 },
  meta: { count: 0, next: null, previous: null },
};

// AsyncThunk: Buyurtma yaratish uchun
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: {
    items: { product_id: number; quantity_kg: number }[];
  }) => {
    const response = await api.post('/orders/', orderData);
    return response.data;
  },
);

// AsyncThunk: Buyurtmalarni olib kelish uchun
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_: void, { getState }) => {
    const state = getState() as RootState;
    const { filters } = state.orders;
    const params: Record<string, string | number> = {
      page: filters.page,
      page_size: filters.page_size,
    };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    const response = await api.get('/orders/', { params });
    return response.data; // expects {count,next,previous,results}
  },
);

// Yangi AsyncThunk: Buyurtma statusini yangilash
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: number; status: string }) => {
    const response = await api.patch(`/orders/${orderId}/update_status/`, {
      status,
    });
    return response.data;
  },
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // <-- YANGI REDUCERS BLOKI
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex(
        (order) => order.id === updatedOrder.id,
      );
      if (index !== -1) {
        state.orders[index] = updatedOrder;
      }
    },
    setOrderFilters: (
      state,
      action: PayloadAction<Partial<OrderState['filters']>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 }; // reset to first page when filters change
    },
    setOrderPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // createOrder holatlari
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Buyurtma yaratishda xatolik';
      })
      // fetchOrders holatlari
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload.results || [];
        state.meta = {
          count: action.payload.count ?? 0,
          next: action.payload.next ?? null,
          previous: action.payload.previous ?? null,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Buyurtmalarni yuklashda xatolik';
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        // Ro'yxatdagi buyurtmani yangi ma'lumot bilan almashtiramiz
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id,
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { updateOrderInList, setOrderFilters, setOrderPage } =
  orderSlice.actions;
export default orderSlice.reducer;
