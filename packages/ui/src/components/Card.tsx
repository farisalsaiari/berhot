import { ReactNode } from 'react';

interface CardProps { children: ReactNode; className?: string; padding?: boolean; }

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}
