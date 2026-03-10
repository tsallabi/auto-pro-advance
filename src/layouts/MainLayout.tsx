import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { MobileBottomNav } from '../components/MobileBottomNav';

export const MainLayout = () => {
  const location = useLocation();

  // Pages that have their own complete custom layout
  const hideLayout =
    ['/marketplace', '/auth'].includes(location.pathname) ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/car-details');

  return (
    <div className="min-h-screen flex flex-col selection:bg-orange-500/30">
      {!hideLayout && <Navbar />}
      {/* pb-16 on mobile leaves room for MobileBottomNav */}
      <main className="flex-grow pb-16 md:pb-0">
        <Outlet />
      </main>
      {!hideLayout && <SiteFooter />}
      {/* Phase 14: Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
};
