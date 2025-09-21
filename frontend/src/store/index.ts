// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice'; // <-- Import qilamiz
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';

const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
