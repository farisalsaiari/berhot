import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const AudiencesPage = lazy(() => import('./pages/AudiencesPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const SmsPage = lazy(() => import('./pages/SmsPage'));
const EmailPage = lazy(() => import('./pages/EmailPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LangRedirect defaultPath="dashboard" />} />
        <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense>} />
        <Route path="campaigns" element={<Suspense fallback={<LoadingSpinner />}><CampaignsPage /></Suspense>} />
        <Route path="audiences" element={<Suspense fallback={<LoadingSpinner />}><AudiencesPage /></Suspense>} />
        <Route path="templates" element={<Suspense fallback={<LoadingSpinner />}><TemplatesPage /></Suspense>} />
        <Route path="sms" element={<Suspense fallback={<LoadingSpinner />}><SmsPage /></Suspense>} />
        <Route path="email" element={<Suspense fallback={<LoadingSpinner />}><EmailPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
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
