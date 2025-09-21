import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import type { User, LoginData, RegisterData } from '../types/auth';

// Xavfsiz JSON parse qilish uchun yordamchi funksiya
const getInitialUser = (): User | null => {
  try {
    const item = localStorage.getItem('user');
    if (item === null || item === 'undefined') {
      return null;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error('Failed to parse user from localStorage', error);
    return null;
  }
};

// Backenddan kelishi mumkin bo'lgan xato turlarini aniqlaymiz
interface ApiError {
  detail?: string;
  // `detail` maydoni `undefined` bo'lishi mumkinligi uchun,
  // index signature ham `undefined`ni o'z ichiga olishi kerak.
  [key: string]: string[] | string | undefined;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: getInitialUser(),
  accessToken: localStorage.getItem('accessToken'),
  status: 'idle',
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register/', data);
      return response.data;
    } catch (err: unknown) {
      // <-- "any" o'rniga "unknown" ishlatamiz
      // Xavfsiz tip tekshiruvi
      const error = err as { response?: { data: ApiError } };
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        detail: "Tarmoqda noma'lum xatolik",
      } as ApiError);
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data: LoginData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login/', data);
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err: unknown) {
      // <-- "any" o'rniga "unknown" ishlatamiz
      const error = err as { response?: { data: ApiError } };
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        detail: "Tarmoqda noma'lum xatolik",
      } as ApiError);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.access;
        const rawUser: Record<string, unknown> = action.payload.user || {};
        // Normalize potential alternative role field names
        const normalizedRole = (rawUser['role'] ||
          rawUser['user_role'] ||
          rawUser['userRole'] ||
          rawUser['type'] ||
          'buyer') as string;
        state.user = {
          id: rawUser['id'] as number,
          username: rawUser['username'] as string,
          email: (rawUser['email'] as string) || '',
          first_name: (rawUser['first_name'] as string) || '',
          last_name: (rawUser['last_name'] as string) || '',
          phone_number: (rawUser['phone_number'] as string) || '',
          address: (rawUser['address'] as string) || '',
          role: normalizedRole as User['role'],
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        const payload = action.payload as ApiError;
        state.error = payload?.detail || 'Login yoki parol xato.';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        const payload = action.payload as ApiError;
        if (payload && typeof payload === 'object') {
          const firstErrorField = Object.keys(payload).find(
            (key) => key !== 'detail',
          );
          if (firstErrorField) {
            const errorMessage = payload[firstErrorField];
            state.error = `${firstErrorField}: ${
              Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
            }`;
            return;
          }
        }
        state.error = "Ro'yxatdan o'tishda noma'lum xatolik yuz berdi.";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
