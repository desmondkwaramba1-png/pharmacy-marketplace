import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import OfflineBanner from './components/OfflineBanner';
import InstallPWABanner from './components/InstallPWABanner';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';

import { Toaster } from 'react-hot-toast';

// Lazy load all pages for code splitting
const HomePage = lazy(() => import('./pages/patient/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/patient/SearchResultsPage'));
const MedicineDetailPage = lazy(() => import('./pages/patient/MedicineDetailPage'));
const MapViewPage = lazy(() => import('./pages/patient/MapViewPage'));
const LoginPage = lazy(() => import('./pages/patient/LoginPage'));
const MyReservationsPage = lazy(() => import('./pages/patient/MyReservationsPage'));

function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <InstallPWABanner />
      <OfflineBanner />
      {children}
      <BottomNav />
      <CartDrawer />
    </div>
  );
}

const Loading = () => (
  <div className="empty-state" style={{ minHeight: '60vh' }}>
    <div className="empty-state-icon">💊</div>
    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading...</p>
  </div>
);

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <PatientLayout>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Patient routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/medicine/:id" element={<MedicineDetailPage />} />
              <Route path="/map" element={<MapViewPage />} />
              <Route path="/reservations" element={<MyReservationsPage />} />

              <Route path="/login" element={<LoginPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </PatientLayout>
        <Toaster position="top-center" />
      </BrowserRouter>
    </CartProvider>
  );
}
