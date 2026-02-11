import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DashboardPage2 = lazy(() => import('./pages/DashboardPage2'));
const QueuePage = lazy(() => import('./pages/QueuePage'));
const QuickOrderPage = lazy(() => import('./pages/QuickOrderPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const BaristaPage = lazy(() => import('./pages/BaristaPage'));
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage'));
const ChangeBusinessPage = lazy(() => import('./pages/ChangeBusinessPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UpgradePlanPage = lazy(() => import('./pages/UpgradePlanPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route index element={<LangRedirect defaultPath="dashboard" />} />
      {/* Main dashboard — standalone with built-in sidebar */}
      <Route path="dashboard/*" element={<Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense>} />
      {/* Legacy dashboard with Layout wrapper */}
      <Route path="dashboard2" element={<Layout />}>
        <Route index element={<Suspense fallback={<LoadingSpinner />}><DashboardPage2 /></Suspense>} />
        <Route path="queue" element={<Suspense fallback={<LoadingSpinner />}><QueuePage /></Suspense>} />
        <Route path="quick-order" element={<Suspense fallback={<LoadingSpinner />}><QuickOrderPage /></Suspense>} />
        <Route path="menu" element={<Suspense fallback={<LoadingSpinner />}><MenuPage /></Suspense>} />
        <Route path="barista" element={<Suspense fallback={<LoadingSpinner />}><BaristaPage /></Suspense>} />
        <Route path="loyalty" element={<Suspense fallback={<LoadingSpinner />}><LoyaltyPage /></Suspense>} />
        <Route path="change-business" element={<Suspense fallback={<LoadingSpinner />}><ChangeBusinessPage /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense>} />
        <Route path="upgrade-plan" element={<Suspense fallback={<LoadingSpinner />}><UpgradePlanPage /></Suspense>} />
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
