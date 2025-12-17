import { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, ChevronDown, User
} from 'lucide-react';
import { Player } from '../../types';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ title, players, qualifyCount, activeMode, showRank = true, id }: { title: string, players: Player[], qualifyCount: number, activeMode?: string, showRank?: boolean, id?: string }) => {
  return (
    <div id={id} className="bg-black/40 border border-slate-700 rounded-xl overflow-hidden backdrop-blur-sm scroll-mt-24">
      <div className="bg-slate-900/80 p-3 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-orbitron text-cyan-400 text-lg tracking-wider">{title}</h3>
        <div className="text-xs font-oxanium text-slate-500">{players.length} PLAYERS</div>
      </div>

      <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {players.length === 0 && (
           <div className="text-center py-8 text-slate-600 font-oxanium text-sm">WAITING FOR DATA...</div>
        )}
        {players.map((p, idx) => {
          const rank = idx + 1;
          const isQualifying = idx < qualifyCount;
          return (
            <div key={p.id} className={`
              flex items-center justify-between p-2 rounded border-l-2 transition-all
              ${isQualifying ? 'bg-cyan-900/10 border-cyan-500' : 'bg-slate-800/30 border-slate-700 opacity-60'}
            `}>
              <div className="flex items-center gap-3">
                {showRank && (
                  <div className={`
                    w-6 h-6 flex items-center justify-center text-xs font-bold rounded
                    ${rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                      rank === 2 ? 'bg-slate-500/20 text-slate-300' :
                      rank === 3 ? 'bg-orange-500/20 text-orange-500' : 'text-slate-500'}
                  `}>{rank}</div>
                )}
                <div>
                   <div className={`font-bold text-sm ${isQualifying ? 'text-white' : 'text-slate-400'}`}>{p.name}</div>
                   <div className="text-[10px] text-slate-500 font-mono">{p.nick}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-oxanium font-bold ${isQualifying ? 'text-cyan-400' : 'text-slate-500'}`}>{p.totalScore}</div>
              </div>
            </div>
          );
        })}
      </div>

      {activeMode && (
        <div className="bg-purple-900/20 border-t border-purple-500/30 p-2 text-center mt-auto">
          <div className="text-[10px] text-purple-400 font-oxanium tracking-widest uppercase mb-1">ACTIVE MODE</div>
          <div className="text-white font-orbitron text-sm animate-pulse shadow-purple-500/50 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
            {activeMode}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TournamentView() {
  const { appState, getPlayersInRoom } = useTournament();
  const navigate = useNavigate();

  // Navigation State
  const [activeSection, setActiveSection] = useState<'QUALIFIERS' | 'SEMIS' | 'FINALS'>('QUALIFIERS');

  // Sync with Admin Default View, but allow user override
  useEffect(() => {
     if (appState.activeRoomViewer) {
        if (['1','2','3','4','5','6'].includes(appState.activeRoomViewer)) setActiveSection('QUALIFIERS');
        else if (['A','B'].includes(appState.activeRoomViewer)) setActiveSection('SEMIS');
        else if (appState.activeRoomViewer === 'FINAL') setActiveSection('FINALS');
     }
  }, [appState.activeRoomViewer]);

  // Scroll to room logic
  const jumpToRoom = (section: 'QUALIFIERS' | 'SEMIS' | 'FINALS', roomId?: string) => {
    setActiveSection(section);
    if (roomId) {
      setTimeout(() => {
        const el = document.getElementById(roomId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500); // Wait for transition
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-900/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="font-orbitron font-bold text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              XFIVE BATTLE SEASON
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-oxanium tracking-widest uppercase">by xfive community</p>
          </div>

          <div className="flex items-center gap-4">
             {/* Desktop Nav */}
             <div className="hidden md:flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
               {['QUALIFIERS', 'SEMIS', 'FINALS'].map(sec => (
                 <button
                   key={sec}
                   onClick={() => setActiveSection(sec as any)}
                   className={`px-4 py-1.5 rounded text-xs font-oxanium transition-all ${activeSection === sec ? 'bg-cyan-600 text-white shadow-[0_0_10px_#0891b2]' : 'text-slate-400 hover:text-white'}`}
                 >
                   {sec}
                 </button>
               ))}
             </div>

             {/* Mobile Dropdown / Quick Jump */}
             <div className="relative group">
               <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-cyan-400">
                 JUMP TO <ChevronDown size={14} />
               </button>
               <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded shadow-xl hidden group-hover:block max-h-80 overflow-y-auto z-50">
                 <div className="p-2 text-[10px] text-slate-500 font-bold">QUALIFIERS</div>
                 {[1,2,3,4,5,6].map(r => (
                   <button key={r} onClick={() => jumpToRoom('QUALIFIERS', `room-${r}`)} className="block w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
                     ROOM {r}
                   </button>
                 ))}

                 <div className="border-t border-slate-800 my-1"></div>
                 <div className="p-2 text-[10px] text-slate-500 font-bold">SEMIS</div>
                 <button onClick={() => jumpToRoom('SEMIS', 'room-A')} className="block w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800">SEMI FINAL 1 (A)</button>
                 <button onClick={() => jumpToRoom('SEMIS', 'room-B')} className="block w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800">SEMI FINAL 2 (B)</button>

                 <div className="border-t border-slate-800 my-1"></div>
                 <div className="p-2 text-[10px] text-slate-500 font-bold">FINALS</div>
                 <button onClick={() => jumpToRoom('FINALS', 'room-FINAL')} className="block w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800">FINAL BATTLE</button>

                 <div className="border-t border-slate-800 my-1"></div>
                 <button onClick={() => navigate('/login')} className="block w-full text-left px-4 py-3 text-xs text-purple-400 hover:bg-slate-800 flex items-center gap-2 font-bold">
                   <User size={12} /> ADMIN LOGIN
                 </button>
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <AnimatePresence mode='wait'>

          {/* QUALIFIERS SLIDE */}
          {activeSection === 'QUALIFIERS' && (
            <motion.div
              key="qualifiers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Day 1 */}
              <div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cyan-900"></div>
                    <h2 className="text-2xl md:text-3xl font-orbitron text-cyan-500 text-center glow-text">KUALIFIKASI HARI 1</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-cyan-900"></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <RoomCard id="room-1" title="ROOM 1" players={getPlayersInRoom('1')} qualifyCount={2} />
                    <RoomCard id="room-2" title="ROOM 2" players={getPlayersInRoom('2')} qualifyCount={2} />
                    <RoomCard id="room-3" title="ROOM 3" players={getPlayersInRoom('3')} qualifyCount={2} />
                 </div>
              </div>

              {/* Day 2 */}
              <div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-purple-900"></div>
                    <h2 className="text-2xl md:text-3xl font-orbitron text-purple-500 text-center glow-text">KUALIFIKASI HARI 2</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-purple-900"></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <RoomCard id="room-4" title="ROOM 4" players={getPlayersInRoom('4')} qualifyCount={2} />
                    <RoomCard id="room-5" title="ROOM 5" players={getPlayersInRoom('5')} qualifyCount={2} />
                    <RoomCard id="room-6" title="ROOM 6" players={getPlayersInRoom('6')} qualifyCount={2} />
                 </div>
              </div>
            </motion.div>
          )}

          {/* SEMI FINALS SLIDE */}
          {activeSection === 'SEMIS' && (
            <motion.div
              key="semis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-orbitron text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-12">SEMI FINAL</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 relative">
                 {/* VS Connector */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center z-10">
                    <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
                 </div>

                 <div className="relative">
                    <div className="absolute -inset-1 bg-cyan-500/20 blur-xl rounded-full"></div>
                    <RoomCard
                      id="room-A"
                      title="SEMI FINAL 1 (ROOM A)"
                      players={getPlayersInRoom('A')}
                      qualifyCount={3}
                      activeMode={appState.activeRoomModes?.['A']}
                    />
                 </div>

                 <div className="relative">
                    <div className="absolute -inset-1 bg-purple-500/20 blur-xl rounded-full"></div>
                    <RoomCard
                      id="room-B"
                      title="SEMI FINAL 2 (ROOM B)"
                      players={getPlayersInRoom('B')}
                      qualifyCount={3}
                      activeMode={appState.activeRoomModes?.['B']}
                    />
                 </div>
              </div>
            </motion.div>
          )}

          {/* FINALS SLIDE */}
          {activeSection === 'FINALS' && (
             <motion.div
               key="finals"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -50 }}
               transition={{ duration: 0.5 }}
               className="max-w-3xl mx-auto text-center"
             >
                <div className="mb-8 animate-bounce text-yellow-500">
                  <Crown size={64} className="mx-auto drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                </div>
                <h2 className="text-5xl md:text-7xl font-orbitron font-black text-yellow-400 mb-2 drop-shadow-lg tracking-widest">FINAL BATTLE</h2>
                <p className="text-slate-400 font-oxanium text-lg mb-12 tracking-[0.5em]">CHAMPIONSHIP</p>

                <div className="relative transform hover:scale-105 transition-transform duration-500">
                   <div className="absolute -inset-2 bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 rounded-2xl opacity-30 blur-2xl animate-pulse"></div>
                   <RoomCard
                      id="room-FINAL"
                      title="FINAL ROOM"
                      players={getPlayersInRoom('FINAL')}
                      qualifyCount={1}
                      activeMode={appState.activeRoomModes?.['FINAL']}
                   />
                </div>
             </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 w-full p-2 text-center text-[10px] text-slate-700 font-mono pointer-events-none">
        XFIVE TOURNAMENT SYSTEM v2.0
      </footer>
    </div>
  );
}
