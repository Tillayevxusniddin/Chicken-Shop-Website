import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithAuth } from '../test-utils/renderWithStore';
import LoginForm from '../components/auth/LoginForm';
import * as authSlice from '../store/authSlice';
import { screen, fireEvent, waitFor } from '@testing-library/react';

describe('Login flow', () => {
  it('successful login dispatch stores tokens', async () => {
    vi.spyOn(authSlice, 'loginUser').mockReturnValue({ unwrap: () => Promise.resolve({}) } as any);
  renderWithAuth(<MemoryRouter><LoginForm /></MemoryRouter>, { accessToken: null });
  const userInput = screen.getAllByLabelText(/Foydalanuvchi nomi/)[0];
  const passInput = screen.getAllByLabelText(/Parol/)[0];
  fireEvent.change(userInput, { target: { value: 'user1' } });
  fireEvent.change(passInput, { target: { value: 'pass' } });
    fireEvent.click(screen.getByText('Kirish'));
    await waitFor(() => {
      expect(authSlice.loginUser).toHaveBeenCalled();
    });
  });

  it('failed login shows console error (silent UI)', async () => {
    const err = new Error('Invalid');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(authSlice, 'loginUser').mockReturnValue({ unwrap: () => Promise.reject(err) } as any);
  renderWithAuth(<MemoryRouter><LoginForm /></MemoryRouter>, { accessToken: null });
  const userInput = screen.getAllByLabelText(/Foydalanuvchi nomi/)[0];
  const passInput = screen.getAllByLabelText(/Parol/)[0];
  fireEvent.change(userInput, { target: { value: 'user1' } });
  fireEvent.change(passInput, { target: { value: 'bad' } });
    fireEvent.click(screen.getByText('Kirish'));
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
