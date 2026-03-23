import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, Cog, LogOut } from 'lucide-react';
import { useClerkSession } from '../lib/clerk';

export function Sidebar() {
  const { signOut, userName, userImageUrl } = useClerkSession();

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 glass-panel border-r border-white/5 flex flex-col z-50 p-6">
      <div className="flex items-center gap-3 mb-12 p-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-premium">
          <Home size={22} strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-black tracking-tight gradient-text">VISZMO</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="sidebar-link-active">
          <LayoutDashboard size={18} strokeWidth={2.5} />
          <span className="font-bold">Overview</span>
        </div>
      </nav>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
          <img src={userImageUrl || "/default-avatar.png"} className="w-10 h-10 rounded-xl" />
          <div className="text-xs font-bold truncate">{userName || 'Scholar'}</div>
          <Cog size={14} className="ml-auto opacity-40 hover:opacity-100 cursor-pointer" />
        </div>
        <button onClick={() => signOut()} className="w-full flex items-center gap-2 p-3 text-sm font-bold text-foreground-secondary hover:text-error hover:bg-error/5 rounded-xl">
          <LogOut size={16} />
          <span>Exit</span>
        </button>
      </div>
    </aside>
  );
}
