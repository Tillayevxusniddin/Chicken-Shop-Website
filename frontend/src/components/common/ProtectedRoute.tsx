// src/components/common/ProtectedRoute.tsx
import React from 'react'; // <-- React'ni import qilamiz
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode; // <-- JSX.Element o'rniga React.ReactNode ishlatamiz
  role: 'buyer' | 'seller';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { accessToken, user } = useAppSelector((state) => state.auth);

  if (!accessToken) {
    // Agar foydalanuvchi tizimga kirmagan bo'lsa, login sahifasiga
    return <Navigate to="/login" />;
  }

  if (user?.role !== role) {
    // Agar foydalanuvchi roli mos kelmasa, bosh sahifaga
    return <Navigate to="/" />;
  }

  return <>{children}</>; // <-- children'ni fragment ichida qaytaramiz
};

export default ProtectedRoute;