import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const LiveQueuePage = lazy(() => import('./pages/LiveQueuePage'));
const WaitlistPage = lazy(() => import('./pages/WaitlistPage'));
const DisplayBoardPage = lazy(() => import('./pages/DisplayBoardPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LangRedirect defaultPath="live-queue" />} />
        <Route path="live-queue" element={<Suspense fallback={<LoadingSpinner />}><LiveQueuePage /></Suspense>} />
        <Route path="waitlist" element={<Suspense fallback={<LoadingSpinner />}><WaitlistPage /></Suspense>} />
        <Route path="display-board" element={<Suspense fallback={<LoadingSpinner />}><DisplayBoardPage /></Suspense>} />
        <Route path="history" element={<Suspense fallback={<LoadingSpinner />}><HistoryPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><SettingsPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LangRedirect defaultPath="live-queue" />} />
      <Route
        path="/:lang/*"
        element={
          <I18nProvider config={{ translations: { en: appEn, ar: appAr } }}>
            <AppRoutes />
          </I18nProvider>
        }
      />
      <Route path="*" element={<LangRedirect defaultPath="live-queue" />} />
    </Routes>
  );
}
