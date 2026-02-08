import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TablesPage = lazy(() => import('./pages/TablesPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const KitchenPage = lazy(() => import('./pages/KitchenPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'));
const ChangeBusinessPage = lazy(() => import('./pages/ChangeBusinessPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route index element={<LangRedirect defaultPath="dashboard" />} />
      <Route path="dashboard" element={<Layout />}>
        <Route index element={<Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense>} />
        <Route path="tables" element={<Suspense fallback={<LoadingSpinner />}><TablesPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<LoadingSpinner />}><OrdersPage /></Suspense>} />
        <Route path="kitchen" element={<Suspense fallback={<LoadingSpinner />}><KitchenPage /></Suspense>} />
        <Route path="menu" element={<Suspense fallback={<LoadingSpinner />}><MenuPage /></Suspense>} />
        <Route path="reservations" element={<Suspense fallback={<LoadingSpinner />}><ReservationsPage /></Suspense>} />
        <Route path="change-business" element={<Suspense fallback={<LoadingSpinner />}><ChangeBusinessPage /></Suspense>} />
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
