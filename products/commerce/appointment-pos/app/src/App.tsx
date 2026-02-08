import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route index element={<LangRedirect defaultPath="dashboard" />} />
      <Route path="dashboard" element={<Layout />}>
        <Route index element={<Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense>} />
        <Route path="calendar" element={<Suspense fallback={<LoadingSpinner />}><CalendarPage /></Suspense>} />
        <Route path="bookings" element={<Suspense fallback={<LoadingSpinner />}><BookingsPage /></Suspense>} />
        <Route path="services" element={<Suspense fallback={<LoadingSpinner />}><ServicesPage /></Suspense>} />
        <Route path="staff" element={<Suspense fallback={<LoadingSpinner />}><StaffPage /></Suspense>} />
        <Route path="clients" element={<Suspense fallback={<LoadingSpinner />}><ClientsPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LangRedirect defaultPath="dashboard" />} />
      <Route
        path="/:lang/*"
        element={
          <I18nProvider config={{ translations: { en: appEn, ar: appAr } }}>
            <AppRoutes />
          </I18nProvider>
        }
      />
      <Route path="*" element={<LangRedirect defaultPath="dashboard" />} />
    </Routes>
  );
}
