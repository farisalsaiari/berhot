import { lazy, Suspense } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const SUPPORTED_LANGS = ['en', 'ar'];

const HomePage = lazy(() => import('./pages/HomePage'));

function AppRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
            <HomePage />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFoundPage homeHref="/" />} />
    </Routes>
  );
}

function LangGuard() {
  const { lang } = useParams<{ lang: string }>();
  if (!lang || !SUPPORTED_LANGS.includes(lang)) {
    return <NotFoundPage homeHref="/" />;
  }
  return (
    <I18nProvider config={{ translations: { en: appEn, ar: appAr } }}>
      <AppRoutes />
    </I18nProvider>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LangRedirect />} />
      <Route path="/:lang/*" element={<LangGuard />} />
      <Route path="*" element={<NotFoundPage homeHref="/" />} />
    </Routes>
  );
}
