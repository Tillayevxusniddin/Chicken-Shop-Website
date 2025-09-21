import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { renderWithAuth } from '../test-utils/renderWithStore';

const Secret = () => <div>Secret</div>;
const Login = () => <div>Login Page</div>;

describe('ProtectedRoute unauth redirect', () => {
  it('redirects to /login when no token', () => {
    const { queryByText } = renderWithAuth(
      <MemoryRouter initialEntries={['/secret']}>        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/secret" element={<ProtectedRoute role="buyer"><Secret /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
      { accessToken: null },
    );
    expect(queryByText('Secret')).toBeNull();
    expect(queryByText('Login Page')).not.toBeNull();
  });
});
