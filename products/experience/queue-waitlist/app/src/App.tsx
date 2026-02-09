import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { PublicLayout } from './components/PublicLayout';
import { DashboardLayout } from './components/DashboardLayout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const HomePage = lazy(() => import('./pages/HomePage'));
const LiveQueuePage = lazy(() => import('./pages/LiveQueuePage'));
const WaitlistPage = lazy(() => import('./pages/WaitlistPage'));
const DisplayBoardPage = lazy(() => import('./pages/DisplayBoardPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — product landing page */}
      <Route element={<PublicLayout />}>
        <Route index element={<Suspense fallback={<LoadingSpinner />}><HomePage /></Suspense>} />
      </Route>

      {/* Dashboard routes — authenticated */}
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route index element={<Suspense fallback={<LoadingSpinner />}><LiveQueuePage /></Suspense>} />
        <Route path="live-queue" element={<Suspense fallback={<LoadingSpinner />}><LiveQueuePage /></Suspense>} />
        <Route path="waitlist" element={<Suspense fallback={<LoadingSpinner />}><WaitlistPage /></Suspense>} />
        <Route path="display-board" element={<Suspense fallback={<LoadingSpinner />}><DisplayBoardPage /></Suspense>} />
        <Route path="history" element={<Suspense fallback={<LoadingSpinner />}><HistoryPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><SettingsPage /></Suspense>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LangRedirect />} />
      <Route
        path="/:lang/*"
        element={
          <I18nProvider config={{ translations: { en: appEn, ar: appAr } }}>
            <AppRoutes />
          </I18nProvider>
        }
      />
      <Route path="*" element={<LangRedirect />} />
    </Routes>
  );
}
