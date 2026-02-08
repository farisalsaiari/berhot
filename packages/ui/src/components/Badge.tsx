import { ReactNode } from 'react';
import { BadgeVariant } from '../types';

const COLORS: Record<BadgeVariant, string> = {
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  orange: 'bg-orange-50 text-orange-700',
  blue: 'bg-blue-50 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-50 text-purple-700',
};

interface BadgeProps { variant: BadgeVariant; children: ReactNode; className?: string; }

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${COLORS[variant]} ${className}`}>
      {children}
    </span>
  );
}
