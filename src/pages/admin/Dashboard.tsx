import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { NeonCard } from '../../components/ui/Shared';
import {
  Settings, Monitor, Users, Dices
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    players, appState, setStage, addPlayer, updateScore,
    runWheel, advanceQualifiers, advanceSemis, setViewerRoom
  } = useTournament();

  const [activeTab, setActiveTab] = useState('manage');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRoom, setNewPlayerRoom] = useState('1');

  // Group players by room for display
  const rooms = ['1', '2', '3', '4', '5', '6', 'A', 'B', 'FINAL'];

  return (
    <div className="space-y-6">
      {/* CONTROL PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NeonCard className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-orbitron text-cyan-400 flex items-center gap-2"><Settings size={18} /> TOURNAMENT CONTROLS</h2>
            <div className="flex gap-2">
               {['QUALIFIERS_D1', 'QUALIFIERS_D2', 'SEMIFINALS', 'FINALS'].map(s => (
                 <button
                   key={s}
                   onClick={() => setStage(s as any)}
                   className={`px-3 py-1 text-xs border rounded ${appState.stage === s ? 'bg-cyan-500 text-black border-cyan-500 font-bold' : 'border-slate-700 text-slate-500'}`}
                 >
                   {s.replace('_', ' ')}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => advanceQualifiers(['1','2','3'])} className="px-4 py-2 bg-purple-900/30 border border-purple-500 text-purple-300 rounded hover:bg-purple-800/50 text-xs font-oxanium">
              AUTO-QUALIFY DAY 1 (Rooms 1-3)
            </button>
            <button onClick={() => advanceQualifiers(['4','5','6'])} className="px-4 py-2 bg-purple-900/30 border border-purple-500 text-purple-300 rounded hover:bg-purple-800/50 text-xs font-oxanium">
              AUTO-QUALIFY DAY 2 (Rooms 4-6)
            </button>
            <button onClick={() => advanceSemis()} className="px-4 py-2 bg-pink-900/30 border border-pink-500 text-pink-300 rounded hover:bg-pink-800/50 text-xs font-oxanium">
              FINISH SEMIS &rarr; FINAL
            </button>
          </div>
        </NeonCard>

        <NeonCard>
          <h2 className="text-lg font-orbitron text-white mb-2 flex items-center gap-2"><Monitor size={18} /> VIEWER ROOM</h2>
          <select
            value={appState.activeRoomViewer}
            onChange={(e) => setViewerRoom(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded focus:border-cyan-500 outline-none"
          >
            {rooms.map(r => <option key={r} value={r}>Room {r}</option>)}
          </select>
          <div className="mt-4 text-xs text-slate-400">
            Select which room is currently displayed on the big screen (Viewer Mode).
          </div>
        </NeonCard>
      </div>

      {/* INPUTS AREA */}
      <div className="flex gap-4 border-b border-slate-800 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 font-oxanium ${activeTab === 'manage' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}>MANAGE PLAYERS</button>
        <button onClick={() => setActiveTab('score')} className={`px-4 py-2 font-oxanium ${activeTab === 'score' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}>SCORING</button>
        <button onClick={() => setActiveTab('wheel')} className={`px-4 py-2 font-oxanium ${activeTab === 'wheel' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500'}`}>SPIN WHEEL</button>
      </div>

      {activeTab === 'manage' && (
        <NeonCard>
          <div className="flex gap-4 mb-6 items-end">
            <div>
              <label className="text-xs text-slate-400">Player Name</label>
              <input
                type="text"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                className="block w-48 bg-slate-900 border border-slate-700 p-2 text-white rounded mt-1"
                placeholder="Nickname"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Assign Room</label>
              <select
                value={newPlayerRoom}
                onChange={e => setNewPlayerRoom(e.target.value)}
                className="block w-24 bg-slate-900 border border-slate-700 p-2 text-white rounded mt-1"
              >
                {rooms.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button
              onClick={() => {
                if(newPlayerName) {
                  addPlayer(newPlayerName, newPlayerRoom);
                  setNewPlayerName('');
                }
              }}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center gap-2"
            >
              <Users size={16} /> ADD
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                <div>
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-xs text-cyan-500">Room {p.room} • {p.status}</div>
                </div>
                <div className="text-xl font-oxanium text-slate-400">{p.totalScore}</div>
              </div>
            ))}
          </div>
        </NeonCard>
      )}

      {activeTab === 'score' && (
        <div className="space-y-8">
          {rooms.map(room => {
            const roomPlayers = players.filter((p: any) => p.room === room && p.status !== 'eliminated');
            if (roomPlayers.length === 0) return null;

            return (
              <div key={room}>
                <h3 className="text-xl font-orbitron text-cyan-400 mb-4 border-l-4 border-cyan-500 pl-3">ROOM {room}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 font-oxanium text-sm">
                        <th className="p-3">PLAYER</th>
                        {[1, 2, 3, 4, 5].map(i => <th key={i} className="p-3">GAME {i}</th>)}
                        <th className="p-3 text-right">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomPlayers.map((p: any) => (
                        <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-white">{p.name}</td>
                          {[0, 1, 2, 3, 4].map(idx => (
                            <td key={idx} className="p-3">
                              <input
                                type="number"
                                className="w-16 bg-black/30 border border-slate-700 p-1 text-center text-cyan-300 rounded focus:border-cyan-500 outline-none"
                                value={p.scores[idx] || ''}
                                onChange={(e) => updateScore(p.id, idx, parseInt(e.target.value) || 0)}
                                placeholder="-"
                              />
                            </td>
                          ))}
                          <td className="p-3 text-right font-oxanium text-xl text-yellow-400">{p.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'wheel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NeonCard glow="purple">
            <h3 className="text-xl font-orbitron text-purple-400 mb-4">WHEEL CONTROLLER (SEMIS)</h3>
            <p className="text-sm text-slate-400 mb-6">Triggering the wheel will randomly assign Reverse, Double, or Boom chance effects to players in the selected room.</p>

            <div className="flex gap-4">
              <button onClick={() => runWheel('A')} className="flex-1 py-4 bg-purple-900/40 border border-purple-500 rounded hover:bg-purple-800/60 text-white font-bold font-orbitron flex flex-col items-center gap-2">
                <Dices size={24} /> SPIN ROOM A
              </button>
              <button onClick={() => runWheel('B')} className="flex-1 py-4 bg-purple-900/40 border border-purple-500 rounded hover:bg-purple-800/60 text-white font-bold font-orbitron flex flex-col items-center gap-2">
                <Dices size={24} /> SPIN ROOM B
              </button>
            </div>
          </NeonCard>

          <div className="space-y-2">
            <h4 className="text-slate-400 font-oxanium">ACTIVE EFFECTS</h4>
            {players.filter((p:any) => p.wheelEffect).map((p:any) => (
              <div key={p.id} className="flex justify-between items-center bg-purple-900/20 border border-purple-500/30 p-3 rounded">
                <span className="text-white font-bold">{p.name}</span>
                <span className="text-purple-300 text-sm font-oxanium">{p.wheelEffect?.desc}</span>
              </div>
            ))}
            {players.filter((p:any) => p.wheelEffect).length === 0 && (
              <div className="text-slate-600 italic">No active wheel effects.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
