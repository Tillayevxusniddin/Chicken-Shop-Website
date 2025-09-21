// src/types/order.ts
import type { Product } from './product';
import type { User } from './auth';

export interface OrderItem {
  id: number;
  product: Product;
  quantity_kg: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total_weight: string;
  notes: string;
  created_at: string;
  items: OrderItem[];
  buyer: User;
}
