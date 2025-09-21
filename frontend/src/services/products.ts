import api from './api';
import type { Product } from '../types/product';
import type { ProductCreate } from '../types/product';

// Helper to build endpoint without duplicating /api prefix if baseURL already has it
export const __testEndpointHelper = (base: string, path: string) => {
  if (/\/api\/?$/.test(base) && path.startsWith('/api/')) {
    return path.replace(/^\/api\//, '/');
  }
  return path;
};

const endpoint = (path: string) => {
  const base = api.defaults.baseURL || '';
  return __testEndpointHelper(base, path);
};

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const fetchProducts = async (
  page: number = 1,
  pageSize: number = 12,
) => {
  const params = { page, page_size: pageSize };
  const url = endpoint('/api/products/');
  const { data } = await api.get<PaginatedResponse<Product>>(url, {
    params,
  });
  return data;
};

export const fetchProduct = async (id: number) => {
  const url = endpoint(`/api/products/${id}/`);
  const { data } = await api.get<Product>(url);
  return data;
};

export const searchProducts = async (
  query: string,
  page: number = 1,
  pageSize: number = 12,
) => {
  const params = { search: query, page, page_size: pageSize };
  const url = endpoint('/api/products/');
  const { data } = await api.get<PaginatedResponse<Product>>(url, {
    params,
  });
  return data;
};

// Seller CRUD operations
export const createProduct = async (payload: Partial<ProductCreate>) => {
  const url = endpoint('/api/products/');
  const { data } = await api.post<Product>(url, payload);
  return data;
};

export const updateProduct = async (
  id: number,
  payload: Partial<ProductCreate>,
) => {
  const url = endpoint(`/api/products/${id}/`);
  const { data } = await api.patch<Product>(url, payload);
  return data;
};

export const deleteProduct = async (id: number) => {
  const url = endpoint(`/api/products/${id}/`);
  await api.delete(url);
};

export const toggleAvailability = async (id: number, is_available: boolean) => {
  return updateProduct(id, { is_available });
};

export const updateStock = async (id: number, stock_kg: number) => {
  return updateProduct(id, { stock_kg });
};
