import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import SellerStatsPage from '../pages/SellerStatsPage';
import * as statsApi from '../services/statsApi';

vi.mock('../services/statsApi');

const baseStats = {
  total_orders: 0,
  total_completed: 0,
  total_weight_completed: 0,
  status_breakdown: {},
  product_type_breakdown: {},
  last7days: [],
};

describe('SellerStatsPage', () => {
  it('renders zero state', async () => {
    (statsApi.fetchSellerStats as any).mockResolvedValueOnce(baseStats);
    render(<MemoryRouter><SellerStatsPage /></MemoryRouter>);
  await waitFor(() => screen.getByText('Jami buyurtmalar'));
  // multiple zeros rendered; ensure at least one numeric 0 summary appears
  expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
  it('renders with data', async () => {
    (statsApi.fetchSellerStats as any).mockResolvedValueOnce({
      ...baseStats,
      total_orders: 5,
      total_completed: 2,
      total_weight_completed: 7.5,
      status_breakdown: { completed: 2, pending: 3 },
      product_type_breakdown: { leg: { orders: 5, quantity_kg: 7.5 } },
      last7days: [ { date: '2025-09-20', count:5, completed_weight:7.5 } ],
    });
    render(<MemoryRouter><SellerStatsPage /></MemoryRouter>);
  await waitFor(() => screen.findAllByText('5'));
  expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });
});
