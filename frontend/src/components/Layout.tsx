import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Calendar as CalendarIcon, ClipboardList, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlanner } from '../context/PlannerContext';

const Layout: React.FC = () => {
  const { activeProfile } = usePlanner();

  return (
    <div className="min-h-screen bg-slate-50 pb-28 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-5 sticky top-0 z-50 flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
                <span className="text-blue-600">Streak</span>Forge
            </h1>
        </Link>
        <Link to="/profiles" className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all active:scale-95 group">
            <div className="text-right hidden xs:block">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Profile</p>
                <p className="text-xs font-black text-slate-900 leading-none">{activeProfile?.name || 'Get Started'}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white italic shadow-lg shadow-slate-200 group-hover:bg-blue-600 transition-colors">
                {activeProfile?.name?.charAt(0).toUpperCase() || <Users size={14} />}
            </div>
        </Link>
      </header>
      
      <main className="flex-1 container max-w-md mx-auto px-4 pt-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-lg px-8 py-4 flex justify-between items-center shadow-2xl z-50 w-[90%] max-w-[360px] rounded-[32px] border border-white/10">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Dash</span>
        </NavLink>
        <NavLink 
          to="/calendar" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <CalendarIcon size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Log</span>
        </NavLink>
        <NavLink 
          to="/plan-builder" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ClipboardList size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Plan</span>
        </NavLink>
        <NavLink 
          to="/stats" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <TrendingUp size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Stats</span>
        </NavLink>
      </nav>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />
      </div>
    </div>
  );
};

export default Layout;
