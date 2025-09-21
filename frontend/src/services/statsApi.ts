import api from './api';

export interface SellerStats {
  total_orders: number;
  total_completed: number;
  total_weight_completed: number;
  status_breakdown: Record<string, number>;
  product_type_breakdown: Record<
    string,
    { orders: number; quantity_kg: number }
  >;
  last7days: { date: string; count: number; completed_weight: number }[];
  metrics?: {
    today_count: number;
    yesterday_count: number;
    day_count_delta_pct: number;
    last7_total: number;
    prev7_total: number;
    week_count_delta_pct: number;
  };
}

export async function fetchSellerStats(): Promise<SellerStats> {
  const res = await api.get('/orders/stats/');
  return res.data;
}
