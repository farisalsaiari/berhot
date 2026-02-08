import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const AccessPage = lazy(() => import('./pages/AccessPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LangRedirect defaultPath="overview" />} />
        <Route path="overview" element={<Suspense fallback={<LoadingSpinner />}><OverviewPage /></Suspense>} />
        <Route path="members" element={<Suspense fallback={<LoadingSpinner />}><MembersPage /></Suspense>} />
        <Route path="plans" element={<Suspense fallback={<LoadingSpinner />}><PlansPage /></Suspense>} />
        <Route path="billing" element={<Suspense fallback={<LoadingSpinner />}><BillingPage /></Suspense>} />
        <Route path="access" element={<Suspense fallback={<LoadingSpinner />}><AccessPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LangRedirect defaultPath="overview" />} />
      <Route
        path="/:lang/*"
        element={
          <I18nProvider config={{ translations: { en: appEn, ar: appAr } }}>
            <AppRoutes />
          </I18nProvider>
        }
      />
      <Route path="*" element={<LangRedirect defaultPath="overview" />} />
    </Routes>
  );
}
