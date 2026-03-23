import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useSidebar } from '../contexts/SidebarContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { hideSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-hidden">
      {!hideSidebar && <Sidebar />}
      <main className={`flex-1 transition-all duration-500 overflow-y-auto ${!hideSidebar ? 'pl-72' : ''}`}>
        <div className="h-full relative z-10">
          {children}
        </div>
        
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-primary/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-accent/10 blur-[120px]" />
        </div>
      </main>
    </div>
  );
}
