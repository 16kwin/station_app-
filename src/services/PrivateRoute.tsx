// services/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuth, isLoading, isLocked } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Если заблокирован, показываем контент, но LockScreen перекроет его
  return <>{children}</>;
};

export default PrivateRoute;