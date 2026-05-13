import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import OfflineBanner from './components/OfflineBanner';
import InstallPWABanner from './components/InstallPWABanner';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

import DesktopNav from './components/DesktopNav';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';

// Patient pages
const HomePage = lazy(() => import('./pages/patient/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/patient/SearchResultsPage'));
const MedicineDetailPage = lazy(() => import('./pages/patient/MedicineDetailPage'));
const MapViewPage = lazy(() => import('./pages/patient/MapViewPage'));
const LoginPage = lazy(() => import('./pages/patient/LoginPage'));
const MyReservationsPage = lazy(() => import('./pages/patient/MyReservationsPage'));
const FavoritesPage = lazy(() => import('./pages/patient/PlaceholderPages').then(m => ({ default: m.default })));
const SettingsPage = lazy(() => import('./pages/patient/PlaceholderPages').then(m => ({ default: m.SettingsPage })));
const HelpPage = lazy(() => import('./pages/patient/PlaceholderPages').then(m => ({ default: m.HelpPage })));

// Pharmacy registration
const PharmacyRegisterPage = lazy(() => import('./pages/PharmacyRegisterPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/InventoryPage'));
const AdminPickupPage = lazy(() => import('./pages/admin/PickupPortalPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/ProfilePage'));

function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="desktop-main-wrapper">
        <DesktopNav />
        <InstallPWABanner />
        <OfflineBanner />
        {children}
        <BottomNav />
        <CartDrawer />
      </div>
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <AdminSidebar />
      <div className="desktop-main-wrapper admin-main-wrapper">
        <OfflineBanner />
        <div className="admin-page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

const Loading = () => (
  <div className="empty-state" style={{ minHeight: '60vh' }}>
    <div className="empty-state-icon">💊</div>
    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading...</p>
  </div>
);

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPharmacist, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/pharmacy/register" replace />;
  if (!isPharmacist) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Pharmacy registration - no layout wrapper */}
            <Route path="/pharmacy/register" element={<PharmacyRegisterPage />} />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <AdminGuard>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                    <Route path="pickups" element={<AdminPickupPage />} />
                    <Route path="profile" element={<AdminProfilePage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminGuard>
            } />

            {/* Patient routes */}
            <Route path="/*" element={
              <PatientLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/medicine/:id" element={<MedicineDetailPage />} />
                  <Route path="/map" element={<MapViewPage />} />
                  <Route path="/reservations" element={<MyReservationsPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PatientLayout>
            } />
          </Routes>
        </Suspense>
        <Toaster position="top-center" />
      </BrowserRouter>
    </CartProvider>
  );
}
