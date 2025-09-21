// src/types/auth.ts

export interface User {
  id: number;
  username: string;
  role: 'buyer' | 'seller';
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
}

export interface LoginData {
  username: string;
  password: string;
}
