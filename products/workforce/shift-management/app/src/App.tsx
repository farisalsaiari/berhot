import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const ShiftsPage = lazy(() => import('./pages/ShiftsPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const RequestsPage = lazy(() => import('./pages/RequestsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LangRedirect defaultPath="schedule" />} />
        <Route path="schedule" element={<Suspense fallback={<LoadingSpinner />}><SchedulePage /></Suspense>} />
        <Route path="shifts" element={<Suspense fallback={<LoadingSpinner />}><ShiftsPage /></Suspense>} />
        <Route path="employees" element={<Suspense fallback={<LoadingSpinner />}><EmployeesPage /></Suspense>} />
        <Route path="requests" element={<Suspense fallback={<LoadingSpinner />}><RequestsPage /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<LoadingSpinner />}><ReportsPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LangRedirect defaultPath="schedule" />} />
      <Route
        path="/:lang/*"
        element={
          <I18nProvider config={{ translations: { en: appEn, ar: appAr } }}>
            <AppRoutes />
          </I18nProvider>
        }
      />
      <Route path="*" element={<LangRedirect defaultPath="schedule" />} />
    </Routes>
  );
}
