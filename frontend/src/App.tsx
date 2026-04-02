import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import OfflineBanner from './components/OfflineBanner';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';

// Lazy load all pages for code splitting
const HomePage = lazy(() => import('./pages/patient/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/patient/SearchResultsPage'));
const MedicineDetailPage = lazy(() => import('./pages/patient/MedicineDetailPage'));
const MapViewPage = lazy(() => import('./pages/patient/MapViewPage'));
const LoginPage = lazy(() => import('./pages/patient/LoginPage'));

function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="app-shell">
        <OfflineBanner />
        {children}
        <BottomNav />
        <CartDrawer />
      </div>
    </CartProvider>
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
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Patient routes */}
          <Route path="/" element={<PatientLayout><HomePage /></PatientLayout>} />
          <Route path="/search" element={<PatientLayout><SearchResultsPage /></PatientLayout>} />
          <Route path="/medicine/:id" element={<PatientLayout><MedicineDetailPage /></PatientLayout>} />
          <Route path="/map" element={<PatientLayout><MapViewPage /></PatientLayout>} />

          <Route path="/login" element={<PatientLayout><LoginPage /></PatientLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
