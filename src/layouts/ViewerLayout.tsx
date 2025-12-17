import { Outlet } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { theme } from '../lib/theme';

export default function ViewerLayout() {
  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden`}>
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0f1a]" />
      <div className="fixed w-full h-2 scanline pointer-events-none z-0" />

      {/* NAVBAR */}
      <nav className="relative z-50 flex justify-between items-center p-4 border-b border-cyan-900/50 bg-[#0b0f1a]/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-900/20 rounded flex items-center justify-center border border-cyan-500 shadow-[0_0_10px_#06b6d4]">
            <Swords className="text-cyan-400" />
          </div>
          <div>
            <h1 className={`${theme.heading} text-xl text-white`}>XFIVE <span className="text-cyan-400">BATTLE</span></h1>
            <p className="text-xs text-slate-500 font-oxanium tracking-widest">SEASON TOURNAMENT</p>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
