import { ReactNode } from 'react';

interface TopbarProps {
  title: string;
  children?: ReactNode;
}

export function Topbar({ title, children }: TopbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-semibold">{title}</h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
