import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { CarDetails } from './pages/CarDetails';
import { CostCalculator } from './pages/CostCalculator';
import { ShippingPage } from './pages/ShippingPage';
import { WalletPage } from './pages/WalletPage';
import { StoreProvider, useStore } from './context/StoreContext';


const DashboardRedirect = () => {
  const { currentUser } = useStore();

  if (!currentUser) return <Navigate to="/auth" replace />;

  if (currentUser.role === 'admin') return <Navigate to="admin" replace />;
  if (currentUser.role === 'seller') return <Navigate to="seller" replace />;
  return <Navigate to="user" replace />;
};

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="marketplace" element={<Home />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="login" element={<Navigate to="/auth" replace />} />
            <Route path="car-details/:id" element={<CarDetails />} />
            <Route path="calculator" element={<CostCalculator />} />
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="wallet" element={<WalletPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/seller" element={<Navigate to="/dashboard/seller" replace />} />

          {/* Dashboard Routes (Admin, User, Seller) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="user" element={<UserDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="seller" element={<SellerDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

