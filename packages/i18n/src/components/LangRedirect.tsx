import { Navigate, useLocation } from 'react-router-dom';
import { detectLang } from '../utils/detect';

interface LangRedirectProps {
  defaultPath?: string;
}

/**
 * Redirects / → /:lang/defaultPath
 * Used as a catch-all to ensure URLs always have a language prefix.
 */
export function LangRedirect({ defaultPath = '' }: LangRedirectProps) {
  const location = useLocation();
  const lang = detectLang(undefined, 'en');

  // If we're at /, redirect to /:lang/defaultPath
  // If we're at /something (no lang prefix), redirect to /:lang/something
  const currentPath = location.pathname === '/' ? defaultPath : location.pathname;
  const cleanPath = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;

  return <Navigate to={`/${lang}/${cleanPath}`} replace />;
}
