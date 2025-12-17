import React from 'react';
import { useParams } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Crown, Lock, ArrowRight, Zap
} from 'lucide-react';
import { GlitchText } from '../../components/ui/Shared';
import { Player } from '../../types';

export default function ViewerPage() {
  const { appState, getPlayersInRoom } = useTournament();
  const { roomId } = useParams();

  // Priority: URL param > Admin Active Room > Default '1'
  const room = roomId || appState.activeRoomViewer || '1';
  const roomPlayers = getPlayersInRoom(room);

  // Determine Qualification Count
  const qualifyCount = appState.stage === 'FINALS' ? 3 : (['A', 'B'].includes(room) ? 3 : 2);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-32">
      {/* HEADER STATS */}
      <div className="flex justify-between items-end mb-8 border-b border-cyan-900/30 pb-4">
        <div>
           <div className="flex items-center gap-2 text-cyan-500 mb-1">
             <Activity className="animate-pulse" size={16} /> LIVE DATA
           </div>
           <GlitchText text={`ROOM ${room}`} size="text-5xl" />
           <div className="text-purple-400 font-oxanium text-lg mt-1 tracking-widest">{appState.stage.replace('_', ' ')}</div>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-xs text-slate-500 font-oxanium">TOTAL PLAYERS</div>
           <div className="text-2xl text-white font-bold">{roomPlayers.length}</div>
        </div>
      </div>

      {/* LEADERBOARD GRID */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode='popLayout'>
          {roomPlayers.map((player: Player, index: number) => {
            const isQualifying = index < qualifyCount;
            const rank = index + 1;

            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`
                  relative flex items-center justify-between p-4 md:p-6 rounded-r-xl border-l-4
                  backdrop-blur-md transition-all duration-300
                  ${isQualifying
                    ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'bg-slate-900/40 border-slate-700 grayscale-[0.5]'}
                `}>

                  {/* Rank & Name */}
                  <div className="flex items-center gap-6">
                    <div className={`
                      w-12 h-12 flex items-center justify-center font-orbitron text-2xl font-bold rounded
                      ${rank === 1 ? 'text-yellow-400 bg-yellow-900/20 border border-yellow-500' :
                        rank === 2 ? 'text-slate-300 bg-slate-700/30 border border-slate-500' :
                        rank === 3 ? 'text-orange-400 bg-orange-900/20 border border-orange-600' : 'text-slate-600'}
                    `}>
                      {rank}
                    </div>

                    <div>
                      <h3 className={`font-bold text-xl md:text-3xl font-orbitron tracking-wide ${isQualifying ? 'text-white' : 'text-slate-500'}`}>
                        {player.name}
                      </h3>
                      {/* Wheel Effect Badge */}
                      {player.wheelEffect && (
                         <motion.div
                           initial={{ scale: 0 }} animate={{ scale: 1 }}
                           className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-purple-900/50 border border-purple-500 text-purple-300 text-xs font-oxanium"
                         >
                           <Zap size={12} /> {player.wheelEffect.desc}
                         </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-8">
                    {/* Game History (Desktop only) */}
                    <div className="hidden md:flex gap-2">
                       {player.scores.map((s, i) => (
                         <div key={i} className="flex flex-col items-center">
                           <span className="text-[10px] text-slate-600">G{i+1}</span>
                           <span className="text-slate-400 font-mono text-sm">{s}</span>
                         </div>
                       ))}
                    </div>

                    {/* Total Score */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-xs text-slate-500 font-oxanium mb-1">TOTAL PTS</div>
                      <div className={`text-3xl md:text-4xl font-oxanium font-bold ${isQualifying ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {player.totalScore}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="w-10 flex justify-center">
                       {isQualifying ? (
                         <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse">
                           <ArrowRight size={24} />
                         </div>
                       ) : (
                         <div className="p-2 rounded-full bg-red-900/10 text-red-900">
                           <Lock size={24} />
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {roomPlayers.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
            <h3 className="text-slate-500 font-orbitron text-xl">WAITING FOR DATA...</h3>
          </div>
        )}
      </div>

      {/* FOOTER ANIMATION (DECORATIVE) */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-20 flex items-end justify-center pb-4">
        {appState.stage === 'FINALS' && (
           <div className="flex gap-4 items-center animate-bounce text-yellow-500 font-orbitron text-sm">
              <Crown size={16} /> FINAL BATTLE IN PROGRESS <Crown size={16} />
           </div>
        )}
      </div>
    </div>
  );
}
