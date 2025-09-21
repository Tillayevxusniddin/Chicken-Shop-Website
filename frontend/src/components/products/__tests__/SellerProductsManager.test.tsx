import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within, act } from '@testing-library/react';
import SellerProductsManager from '../SellerProductsManager';
import { renderWithAuth } from '../../../test-utils/renderWithStore';

const sampleProducts = [
  { id: 1, name: 'B Leg', product_type: 'leg', description: '', is_available: true, stock_kg: 5, created_at: '', updated_at: '' },
  { id: 2, name: 'A Wing', product_type: 'wing', description: '', is_available: false, stock_kg: 3, created_at: '', updated_at: '' },
  { id: 3, name: 'C Breast', product_type: 'breast', description: '', is_available: true, stock_kg: 7, created_at: '', updated_at: '' },
];


const fetchImpl = vi.fn(async () => ({ results: sampleProducts }));
const updateStockImpl = vi.fn(async (id:number, val:number) => {
  const f = sampleProducts.find(p=>p.id===id)!; return { ...f, stock_kg: val };
});

const setup = (props: any = {}) => renderWithAuth(
  <SellerProductsManager
    skipFetch
    initialRows={sampleProducts}
    fetchImpl={fetchImpl}
    updateStockImpl={updateStockImpl}
  debounceMs={0}
    {...props}
  />, { role: 'seller' });

describe('SellerProductsManager', () => {
  it('loads and renders rows', async () => {
  setup();
  expect(screen.getByText('Mahsulotlarni boshqarish')).toBeInTheDocument();
    const dataRows = screen.getAllByRole('row').filter(r => within(r).queryByText('B Leg') || within(r).queryByText('A Wing') || within(r).queryByText('C Breast'));
    expect(dataRows.length).toBe(3);
  });

  it('sorts by name ascending/descending when header clicked', async () => {
  setup();
    const nameHeader = screen.getByRole('button', { name: /Nom/i });
    fireEvent.click(nameHeader);
    const rowsAfterFirst = screen.getAllByRole('row').slice(1);
    const firstName1 = within(rowsAfterFirst[0]).getAllByRole('cell')[0].textContent;
    fireEvent.click(nameHeader);
    const rowsAfterSecond = screen.getAllByRole('row').slice(1);
    const firstName2 = within(rowsAfterSecond[0]).getAllByRole('cell')[0].textContent;
    expect(firstName1).not.toEqual(firstName2);
  });

  it('debounces stock update and sends one request', async () => {
    const localUpdate = vi.fn(async (id:number, val:number) => ({ ...sampleProducts[0], id, stock_kg: val }));
    vi.useFakeTimers();
    setup({ updateStockImpl: localUpdate, debounceMs: 40 });
    const legRow = screen.getByText('B Leg').closest('tr')!;
    const stockInput = within(legRow).getByDisplayValue('5') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(stockInput, { target: { value: '6' } });
      fireEvent.change(stockInput, { target: { value: '6.5' } });
      fireEvent.change(stockInput, { target: { value: '7' } });
      vi.advanceTimersByTime(45);
    });
    expect(localUpdate).toHaveBeenCalledTimes(1);
    expect(localUpdate).toHaveBeenLastCalledWith(1, 7);
    vi.useRealTimers();
  });

  it('reverts via reload on stock update error', async () => {
    const failingUpdate = vi.fn().mockRejectedValueOnce(new Error('fail'));
    const fetchSpy = vi.fn(async () => ({ results: sampleProducts }));
    vi.useFakeTimers();
    setup({ updateStockImpl: failingUpdate, fetchImpl: fetchSpy, debounceMs:40 });
    const legRow = screen.getByText('B Leg').closest('tr')!;
    const stockInput = within(legRow).getByDisplayValue('5') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(stockInput, { target: { value: '8' } });
      vi.advanceTimersByTime(45);
    });
    expect(failingUpdate).toHaveBeenCalledTimes(1);
    // Component triggers reload on error
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
