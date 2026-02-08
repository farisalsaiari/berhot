import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import { Layout } from './components/Layout';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const TicketsPage = lazy(() => import('./pages/TicketsPage'));
const AttendeesPage = lazy(() => import('./pages/AttendeesPage'));
const CheckinPage = lazy(() => import('./pages/CheckinPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LangRedirect defaultPath="dashboard" />} />
        <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<LoadingSpinner />}><EventsPage /></Suspense>} />
        <Route path="tickets" element={<Suspense fallback={<LoadingSpinner />}><TicketsPage /></Suspense>} />
        <Route path="attendees" element={<Suspense fallback={<LoadingSpinner />}><AttendeesPage /></Suspense>} />
        <Route path="checkin" element={<Suspense fallback={<LoadingSpinner />}><CheckinPage /></Suspense>} />
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
