// Layouts
export { AppShell } from './layouts/AppShell';
export { Sidebar } from './layouts/Sidebar';
export { Topbar } from './layouts/Topbar';

// Components
export { StatCard } from './components/StatCard';
export { DataTable } from './components/DataTable';
export { Badge } from './components/Badge';
export { Card } from './components/Card';
export { Button } from './components/Button';
export { TabBar } from './components/TabBar';
export { EmptyState } from './components/EmptyState';
export { SearchInput } from './components/SearchInput';
export { ProgressBar } from './components/ProgressBar';

// Production Components
export { LoadingSpinner } from './components/LoadingSpinner';
export { ErrorBoundary } from './components/ErrorBoundary';
export { NotFoundPage } from './components/NotFoundPage';

// Auth Components
export { SignInPage } from './components/auth/SignInPage';
export { SignInForm } from './components/auth/SignInForm';
export { OtpInput, type OtpInputHandle } from './components/auth/OtpInput';
export type { AuthStep, CheckUserResult, GoogleProfileData } from './components/auth/SignInForm';
export type { SignInPageProps } from './components/auth/SignInPage';

// Types
export type { SidebarItem, StatCardProps, BadgeVariant, Column } from './types';
