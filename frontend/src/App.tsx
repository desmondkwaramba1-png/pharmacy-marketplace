import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import OfflineBanner from './components/OfflineBanner';
import BottomNav from './components/BottomNav';
import AdminNav from './components/AdminNav';

// Lazy load all pages for code splitting
const HomePage = lazy(() => import('./pages/patient/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/patient/SearchResultsPage'));
const MedicineDetailPage = lazy(() => import('./pages/patient/MedicineDetailPage'));
const MapViewPage = lazy(() => import('./pages/patient/MapViewPage'));
const LoginPage = lazy(() => import('./pages/pharmacy/LoginPage'));
const DashboardPage = lazy(() => import('./pages/pharmacy/DashboardPage'));
const InventoryPage = lazy(() => import('./pages/pharmacy/InventoryPage'));
const ProfilePage = lazy(() => import('./pages/pharmacy/ProfilePage'));

function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <OfflineBanner />
      {children}
      <BottomNav />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <AdminNav />
      <OfflineBanner />
      {children}
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
          {/* Patient routes */}
          <Route path="/" element={<PatientLayout><HomePage /></PatientLayout>} />
          <Route path="/search" element={<PatientLayout><SearchResultsPage /></PatientLayout>} />
          <Route path="/medicine/:id" element={<PatientLayout><MedicineDetailPage /></PatientLayout>} />
          <Route path="/map" element={<PatientLayout><MapViewPage /></PatientLayout>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute><AdminLayout><InventoryPage /></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute><AdminLayout><ProfilePage /></AdminLayout></ProtectedRoute>
          } />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
