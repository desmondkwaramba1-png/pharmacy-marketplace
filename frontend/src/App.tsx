import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import React, { Suspense, lazy, useEffect } from 'react';
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

// Public
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

// Patient pages
const HomePage = lazy(() => import('./pages/patient/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/patient/SearchResultsPage'));
const MedicineDetailPage = lazy(() => import('./pages/patient/MedicineDetailPage'));
const MapViewPage = lazy(() => import('./pages/patient/MapViewPage'));
const MyReservationsPage = lazy(() => import('./pages/patient/MyReservationsPage'));
const FavoritesPage = lazy(() => import('./pages/patient/PlaceholderPages').then(m => ({ default: m.default })));
const SettingsPage = lazy(() => import('./pages/patient/PlaceholderPages').then(m => ({ default: m.SettingsPage })));
const HelpPage = lazy(() => import('./pages/patient/PlaceholderPages').then(m => ({ default: m.HelpPage })));

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/InventoryPage'));
const AdminPickupPage = lazy(() => import('./pages/admin/PickupPortalPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/ProfilePage'));

const Loading = () => (
  <div className="empty-state" style={{ minHeight: '60vh' }}>
    <div className="empty-state-icon">💊</div>
    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading...</p>
  </div>
);

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

// Root: landing for guests, patient home for patients, redirect for pharmacists
function RootRoute() {
  const { isAuthenticated, isPharmacist, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <LandingPage />;
  if (isPharmacist) return <Navigate to="/admin/dashboard" replace />;
  return (
    <PatientLayout>
      <Suspense fallback={<Loading />}>
        <HomePage />
      </Suspense>
    </PatientLayout>
  );
}

// Guard for patient sub-routes (not root)
function PatientGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPharmacist, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (isPharmacist) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

// Protect admin routes
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPharmacist, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isPharmacist) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Post-login redirect based on role
function LoginRedirect() {
  const { isAuthenticated, isPharmacist, isLoading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(isPharmacist ? '/admin/dashboard' : '/home', { replace: true });
    }
  }, [isAuthenticated, isPharmacist, isLoading, navigate]);
  return <Loading />;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Root — smart: landing / patient home / admin redirect */}
            <Route path="/" element={<RootRoute />} />

            {/* Auth */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/pharmacy/register" element={<Navigate to="/login?tab=pharmacy" replace />} />
            <Route path="/auth/redirect" element={<LoginRedirect />} />

            {/* Admin */}
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

            {/* Patient app (requires login) */}
            <Route path="/home" element={
              <PatientGuard>
                <PatientLayout><Suspense fallback={<Loading />}><HomePage /></Suspense></PatientLayout>
              </PatientGuard>
            } />
            <Route path="/search" element={
              <PatientGuard>
                <PatientLayout><Suspense fallback={<Loading />}><SearchResultsPage /></Suspense></PatientLayout>
              </PatientGuard>
            } />
            <Route path="/medicine/:id" element={
              <PatientGuard>
                <PatientLayout><Suspense fallback={<Loading />}><MedicineDetailPage /></Suspense></PatientLayout>
              </PatientGuard>
            } />
            <Route path="/map" element={
              <PatientGuard>
                <PatientLayout><Suspense fallback={<Loading />}><MapViewPage /></Suspense></PatientLayout>
              </PatientGuard>
            } />
            <Route path="/reservations" element={
              <PatientGuard>
                <PatientLayout><Suspense fallback={<Loading />}><MyReservationsPage /></Suspense></PatientLayout>
              </PatientGuard>
            } />
            <Route path="/favorites" element={
              <PatientGuard>
                <PatientLayout><Suspense fallback={<Loading />}><FavoritesPage /></Suspense></PatientLayout>
              </PatientGuard>
            } />
            <Route path="/settings" element={
              <PatientGuard>
                <PatientLayout><Suspense fallback={<Loading />}><SettingsPage /></Suspense></PatientLayout>
              </PatientGuard>
            } />
            <Route path="/help" element={
              <PatientGuard>
                <PatientLayout><Suspense fallback={<Loading />}><HelpPage /></Suspense></PatientLayout>
              </PatientGuard>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-center" />
      </BrowserRouter>
    </CartProvider>
  );
}
