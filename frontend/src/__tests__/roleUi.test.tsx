import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Header from '../components/common/Header';
import { ColorModeProvider } from '../components/common/ColorModeContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { renderWithAuth } from '../test-utils/renderWithStore';

const SellerOnly = () => <div>Seller Secret</div>;
const Home = () => <div>Home Page</div>;
const Login = () => <div>Login Page</div>;

describe('Role-based UI & routing', () => {
  if (!window.matchMedia) {
    // Minimal mock for tests
    // @ts-ignore
    window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
  }
  it('shows seller dashboard link for seller', () => {
    const { queryByText } = renderWithAuth(
      <MemoryRouter>
        <ColorModeProvider>
          <Header />
        </ColorModeProvider>
      </MemoryRouter>,
      { role: 'seller' },
    );
    expect(queryByText('Boshqaruv Paneli')).not.toBeNull();
  });

  it('hides seller dashboard link for buyer', () => {
    const { queryByText } = renderWithAuth(
      <MemoryRouter>
        <ColorModeProvider>
          <Header />
        </ColorModeProvider>
      </MemoryRouter>,
      { role: 'buyer' },
    );
    expect(queryByText('Boshqaruv Paneli')).toBeNull();
  });

  it('blocks buyer from seller route', () => {
    const { getByText } = renderWithAuth(
      <MemoryRouter initialEntries={['/seller-only']}>        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/seller-only"
            element={
              <ProtectedRoute role="seller">
                <SellerOnly />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
      { role: 'buyer' },
    );
    // Should redirect to home (since buyer role mismatch)
  expect(getByText('Home Page')).not.toBeNull();
  });

  it('allows seller to access protected seller route', () => {
    const { getByText } = renderWithAuth(
      <MemoryRouter initialEntries={['/seller-only']}>        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/seller-only"
            element={
              <ProtectedRoute role="seller">
                <SellerOnly />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
      { role: 'seller' },
    );
  expect(getByText('Seller Secret')).not.toBeNull();
  });
});