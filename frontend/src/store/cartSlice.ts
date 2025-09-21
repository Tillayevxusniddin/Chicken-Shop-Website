// src/store/cartSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../types/product';

interface CartItem {
  product: Product;
  quantity_kg: number;
}

interface CartState {
  items: CartItem[];
}

// Savat ma'lumotlarini localStorage'dan o'qib olamiz, agar mavjud bo'lsa
const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Reducer: Savatga mahsulot qo'shish
    addToCart: (state, action: PayloadAction<Product>) => {
      const productToAdd = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === productToAdd.id,
      );

      if (existingItem) {
        // Agar mahsulot allaqachon mavjud bo'lsa, miqdorini 1 ga oshiramiz
        existingItem.quantity_kg += 1;
      } else {
        // Aks holda, yangi mahsulot sifatida qo'shamiz
        state.items.push({ product: productToAdd, quantity_kg: 1 });
      }
      // O'zgarishlarni localStorage'ga saqlab qo'yamiz
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    incrementQuantity: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const item = state.items.find((i) => i.product.id === id);
      if (item) {
        item.quantity_kg += 1;
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    decrementQuantity: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const item = state.items.find((i) => i.product.id === id);
      if (item) {
        item.quantity_kg = Math.max(1, item.quantity_kg - 1);
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    setQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product.id === productId);
      if (item) {
        item.quantity_kg = Math.max(1, quantity);
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    // Reducer: Mahsulot miqdorini o'zgartirish
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      const itemToUpdate = state.items.find(
        (item) => item.product.id === productId,
      );
      if (itemToUpdate) {
        itemToUpdate.quantity_kg = quantity;
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    // Reducer: Mahsulotni savatdan o'chirish
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload,
      );
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    // Reducer: Savatni tozalash
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  incrementQuantity,
  decrementQuantity,
  setQuantity,
} = cartSlice.actions;
export default cartSlice.reducer;
