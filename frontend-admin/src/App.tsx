import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import OfflineBanner from './components/OfflineBanner';
import AdminNav from './components/AdminNav';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';

// Lazy load all pages for code splitting
const LoginPage = lazy(() => import('./pages/pharmacy/LoginPage'));
const DashboardPage = lazy(() => import('./pages/pharmacy/DashboardPage'));
const InventoryPage = lazy(() => import('./pages/pharmacy/InventoryPage'));
const PickupPortalPage = lazy(() => import('./pages/pharmacy/PickupPortalPage'));
const ProfilePage = lazy(() => import('./pages/pharmacy/ProfilePage'));

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="desktop-main-wrapper">
        <AdminNav />
        <OfflineBanner />
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="empty-state"><div className="empty-state-icon">💊</div><p>Loading...</p></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

const Loading = () => (
  <div className="empty-state" style={{ minHeight: '60vh' }}>
    <div className="empty-state-icon">💊</div>
    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading...</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>


          {/* Admin routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute><AdminLayout><InventoryPage /></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/pickups" element={
            <ProtectedRoute><AdminLayout><PickupPortalPage /></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute><AdminLayout><ProfilePage /></AdminLayout></ProtectedRoute>
          } />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
