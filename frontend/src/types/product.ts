// src/types/product.ts

export interface Product {
  id: number;
  name: string;
  product_type: 'leg' | 'wing' | 'breast';
  description: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  image?: string | null;
  stock_kg: number; // server authoritative stock in kg
}

export type ProductSummary = Pick<
  Product,
  'id' | 'name' | 'image' | 'product_type' | 'is_available' | 'stock_kg'
>;
export type ProductCreate = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
