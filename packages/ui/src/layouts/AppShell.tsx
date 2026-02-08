import { ReactNode } from 'react';

interface AppShellProps {
  sidebar: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className="grid grid-cols-[240px_1fr] h-screen">
      {sidebar}
      <main className="flex flex-col overflow-hidden">
        {topbar}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}
