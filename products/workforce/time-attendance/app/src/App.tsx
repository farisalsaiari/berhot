import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const ClockPage = lazy(() => import('./pages/ClockPage'));
const LogPage = lazy(() => import('./pages/LogPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const DevicesPage = lazy(() => import('./pages/DevicesPage'));
const OvertimePage = lazy(() => import('./pages/OvertimePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LangRedirect defaultPath="clock" />} />
        <Route path="clock" element={<Suspense fallback={<LoadingSpinner />}><ClockPage /></Suspense>} />
        <Route path="log" element={<Suspense fallback={<LoadingSpinner />}><LogPage /></Suspense>} />
        <Route path="employees" element={<Suspense fallback={<LoadingSpinner />}><EmployeesPage /></Suspense>} />
        <Route path="devices" element={<Suspense fallback={<LoadingSpinner />}><DevicesPage /></Suspense>} />
        <Route path="overtime" element={<Suspense fallback={<LoadingSpinner />}><OvertimePage /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<LoadingSpinner />}><ReportsPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LangRedirect defaultPath="clock" />} />
      <Route
        path="/:lang/*"
        element={
          <I18nProvider config={{ translations: { en: appEn, ar: appAr } }}>
            <AppRoutes />
          </I18nProvider>
        }
      />
      <Route path="*" element={<LangRedirect defaultPath="clock" />} />
    </Routes>
  );
}
