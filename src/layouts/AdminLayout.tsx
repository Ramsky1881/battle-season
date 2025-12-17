import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { theme } from '../lib/theme';

export default function AdminLayout() {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden`}>
      {/* NAVBAR */}
      <nav className="relative z-50 flex justify-between items-center p-4 border-b border-cyan-900/50 bg-[#0b0f1a]/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-900/20 rounded flex items-center justify-center border border-cyan-500 shadow-[0_0_10px_#06b6d4]">
            <Swords className="text-cyan-400" />
          </div>
          <div>
            <h1 className={`${theme.heading} text-xl text-white`}>XFIVE <span className="text-cyan-400">ADMIN</span></h1>
            <p className="text-xs text-slate-500 font-oxanium tracking-widest">CONTROL CENTER</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/tournament" target="_blank" className="px-4 py-1 rounded border font-oxanium text-sm bg-cyan-900/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors">
             OPEN VIEWER
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('admin_auth');
              window.location.href = '/admin/login';
            }}
            className="px-4 py-1 rounded border border-red-900/50 text-red-500 font-oxanium text-sm hover:bg-red-900/20"
          >
            LOGOUT
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* BACKGROUND */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
    </div>
  );
}
