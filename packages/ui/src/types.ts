import { ReactNode } from 'react';

export interface SidebarItem {
  icon: ReactNode;
  label: string;
  key: string;
  href?: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
}

export type BadgeVariant = 'green' | 'red' | 'orange' | 'blue' | 'gray' | 'purple';

export interface Column<T = any> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}
