import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
// Mock before imports that depend on it
vi.mock('../services/products', () => ({
  fetchProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  toggleAvailability: vi.fn(),
  updateStock: vi.fn(),
}));
import * as productService from '../services/products';
import SellerProductsManager from '../components/products/SellerProductsManager';
import { renderWithAuth } from '../test-utils/renderWithStore';

const sampleProducts = [
  { id: 1, name: 'B Leg', product_type: 'leg', description: '', is_available: true, stock_kg: 5, created_at: '', updated_at: '' },
  { id: 2, name: 'A Wing', product_type: 'wing', description: '', is_available: false, stock_kg: 3, created_at: '', updated_at: '' },
  { id: 3, name: 'C Breast', product_type: 'breast', description: '', is_available: true, stock_kg: 7, created_at: '', updated_at: '' },
];

beforeEach(() => {
  vi.useFakeTimers();
  (productService.fetchProducts as any).mockResolvedValue({ count: 3, next: null, previous: null, results: sampleProducts });
  (productService.updateStock as any).mockImplementation(async (id: number, value: number) => {
    const found = sampleProducts.find(p => p.id === id)!;
    return { ...found, stock_kg: value };
  });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
});

const setup = () => renderWithAuth(<SellerProductsManager />, { role: 'seller' });

describe('SellerProductsManager', () => {
  it('loads and renders rows', async () => {
    setup();
    expect(await screen.findByText('Mahsulotlarni boshqarish')).toBeInTheDocument();
    // Wait for one of the product names to ensure fetch finished
    await screen.findByText('B Leg');
    const dataRows = screen.getAllByRole('row').filter(r => within(r).queryByText('B Leg') || within(r).queryByText('A Wing') || within(r).queryByText('C Breast'));
    expect(dataRows.length).toBe(3);
    expect(screen.getByText('B Leg')).toBeInTheDocument();
    expect(screen.getByText('A Wing')).toBeInTheDocument();
  });

  it('sorts by name ascending/descending when header clicked', async () => {
    setup();
    await screen.findByText('B Leg');
    const nameHeader = screen.getByRole('button', { name: /Nom/i });
    // First click sets desc (initial asc -> toggles)
    fireEvent.click(nameHeader);
    const rowsAfterFirst = screen.getAllByRole('row').slice(1); // skip header
    const firstName1 = within(rowsAfterFirst[0]).getAllByRole('cell')[0].textContent;
    // Second click toggles again
    fireEvent.click(nameHeader);
    const rowsAfterSecond = screen.getAllByRole('row').slice(1);
    const firstName2 = within(rowsAfterSecond[0]).getAllByRole('cell')[0].textContent;
    expect(firstName1).not.toEqual(firstName2);
  });

  it('paginates when rowsPerPage changed', async () => {
    setup();
    await screen.findByText('B Leg');
    const rowsPerSelect = screen.getByLabelText(/Satrlar/i);
    fireEvent.change(rowsPerSelect, { target: { value: '5' } });
    // still should show first page entries
    await waitFor(() => expect(screen.getByText('A Wing')).toBeInTheDocument());
  });

  it('debounces stock update and sends one request', async () => {
    setup();
    await screen.findByText('B Leg');
    const legRow = screen.getByText('B Leg').closest('tr')!;
    const stockInput = within(legRow).getByDisplayValue('5') as HTMLInputElement;
    fireEvent.change(stockInput, { target: { value: '6' } });
    fireEvent.change(stockInput, { target: { value: '6.5' } });
    fireEvent.change(stockInput, { target: { value: '7' } });
    // Fast consecutive changes -> debounce should call updateStock once after timer flush
    expect(productService.updateStock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(650);
    await waitFor(() => expect(productService.updateStock).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(productService.updateStock).toHaveBeenCalledWith(1, 7);
  });

  it('reverts via reload on stock update error', async () => {
    (productService.updateStock as any).mockRejectedValueOnce(new Error('fail')); // first call fails
    setup();
    await screen.findByText('B Leg');
    const legRow = screen.getByText('B Leg').closest('tr')!;
    const stockInput = within(legRow).getByDisplayValue('5') as HTMLInputElement;
    fireEvent.change(stockInput, { target: { value: '8' } });
    vi.advanceTimersByTime(650);
    await waitFor(() => expect(productService.updateStock).toHaveBeenCalledTimes(1), { timeout: 2000 });
    await waitFor(() => expect(productService.fetchProducts).toHaveBeenCalledTimes(2), { timeout: 2000 });
  });
});
