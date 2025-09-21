import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Umumiy komponentlar
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Sahifalar
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerStatsPage from './pages/SellerStatsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Asosiy Layout - bu barcha sahifalarga Header va Footer qo'shadi */}
        <Route path="/" element={<Layout />}>
          
          {/* Hammaga ochiq (Public) sahifalar */}
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="cart" element={<ProtectedRoute role="buyer"><CartPage /></ProtectedRoute>} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Tizimga kirgan foydalanuvchilar uchun sahifalar */}
          <Route 
            path="orders" 
            element={
              <ProtectedRoute role="buyer">
                <OrdersPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Faqat SOTUVCHI uchun sahifalar */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute role="seller">
                <SellerDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dashboard/stats" 
            element={
              <ProtectedRoute role="seller">
                <SellerStatsPage />
              </ProtectedRoute>
            } 
          />

          {/* Agar manzil topilmasa (404 Not Found) */}
          {/* Hozircha bu shart emas, keyinroq qo'shishingiz mumkin */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
