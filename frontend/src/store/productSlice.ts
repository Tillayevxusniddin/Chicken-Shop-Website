// src/store/productSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import type { Product } from '../types/product'; // Hali bu type'ni yaratamiz

// 1. State uchun interfeys (TypeScript uchun)
interface ProductState {
  products: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 2. Boshlang'ich holat
const initialState: ProductState = {
  products: [],
  status: 'idle', // 'idle' - bo'sh, 'loading' - yuklanmoqda, 'succeeded' - muvaffaqiyatli, 'failed' - xatolik
  error: null,
};

// 3. Asinxron Thunk (Backend'dan ma'lumot olib keluvchi "kuryer")
interface PaginatedProducts {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Product[];
  [key: string]: unknown;
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await api.get<PaginatedProducts | Product[]>('/products/');
    const data = response.data;
    if (Array.isArray(data)) {
      return data as Product[];
    }
    if (data && Array.isArray(data.results)) {
      return data.results as Product[];
    }
    console.warn('Unexpected products response shape', data);
    return [] as Product[];
  },
);

// 4. Slice'ning o'zini yaratamiz
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Bu yerga sinxron logikalar yoziladi (hozircha shart emas)
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'; // So'rov boshlanganda
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.status = 'succeeded'; // Muvaffaqiyatli tugaganda
          state.products = action.payload; // Ma'lumotlarni state'ga joylaymiz
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'; // Xatolik yuz berganda
        state.error = action.error.message || 'Mahsulotlarni yuklashda xatolik';
      });
  },
});

export default productSlice.reducer;
