import { lazy, Suspense } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { I18nProvider, LangRedirect } from '@berhot/i18n';
import { LoadingSpinner, NotFoundPage } from '@berhot/ui';
import appEn from './locales/en.json';
import appAr from './locales/ar.json';

const SUPPORTED_LANGS = ['en', 'ar'];

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const SignInPageWrapper = lazy(() => import('./pages/SignInPageWrapper'));

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
      <Route
        path="products"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
            <ProductsPage />
          </Suspense>
        }
      />
      <Route
        path="pricing"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
            <PricingPage />
          </Suspense>
        }
      />
      <Route
        path="partners"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
            <PartnersPage />
          </Suspense>
        }
      />
      <Route
        path="dashboard"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
            <DashboardPage />
          </Suspense>
        }
      />
      <Route
        path="shop/hardware/us/:lang/my-orders"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
            <MyOrdersPage />
          </Suspense>
        }
      />
      <Route
        path="signin"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
            <SignInPageWrapper />
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
