import { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { NeonCard } from '../../components/ui/Shared';
import {
  Settings, Monitor, Users, Dices, Edit, Trash, Save, X
} from 'lucide-react';
import { Player, WheelMode } from '../../types';

export default function AdminDashboard() {
  const {
    players, appState, wheelModes, setStage, addPlayer, updatePlayer, deletePlayer, updateScore,
    spinRoomMode, addMode, updateMode, deleteMode, advanceQualifiers, advanceSemis, setViewerRoom
  } = useTournament();

  const [activeTab, setActiveTab] = useState('manage');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Add Player State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNick, setNewPlayerNick] = useState('');
  const [newPlayerRoom, setNewPlayerRoom] = useState('1');

  // Edit Player State
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Wheel Mode State
  const [newModeName, setNewModeName] = useState('');
  const [newModeDesc, setNewModeDesc] = useState('');
  const [editingMode, setEditingMode] = useState<WheelMode | null>(null);

  // Constants
  const rooms = ['1', '2', '3', '4', '5', '6', 'A', 'B', 'FINAL'];
  const filters = [
    { id: 'ALL', label: 'ALL PLAYERS' },
    { id: 'QUAL_D1', label: 'KUALIFIKASI HARI 1' },
    { id: 'QUAL_D2', label: 'KUALIFIKASI HARI 2' },
    { id: 'SEMIS', label: 'SEMI FINAL' },
    { id: 'FINAL', label: 'FINAL BATTLE' },
    { id: 'LOSE', label: 'LOSE' }
  ];

  // Helpers
  const getFilteredPlayers = () => {
    switch (activeFilter) {
      case 'QUAL_D1': return players.filter(p => ['1','2','3'].includes(p.room));
      case 'QUAL_D2': return players.filter(p => ['4','5','6'].includes(p.room));
      case 'SEMIS': return players.filter(p => ['A','B'].includes(p.room));
      case 'FINAL': return players.filter(p => p.room === 'FINAL');
      case 'LOSE': return players.filter(p => p.status === 'eliminated');
      default: return players;
    }
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return;
    await updatePlayer(editingPlayer.id, {
      name: editingPlayer.name,
      nick: editingPlayer.nick,
      room: editingPlayer.room,
      status: editingPlayer.status
    });
    setEditingPlayer(null);
  };

  const handleUpdateMode = async () => {
    if (!editingMode) return;
    await updateMode(editingMode.id, {
      name: editingMode.name,
      description: editingMode.description
    });
    setEditingMode(null);
  };

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
        <div className="space-y-6">
          {/* Add Player Form */}
          <NeonCard>
            <h3 className="text-cyan-400 font-orbitron mb-4 text-sm">ADD NEW PLAYER</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs text-slate-400">Player Name</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  className="block w-48 bg-slate-900 border border-slate-700 p-2 text-white rounded mt-1"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Nickname (In-Game)</label>
                <input
                  type="text"
                  value={newPlayerNick}
                  onChange={e => setNewPlayerNick(e.target.value)}
                  className="block w-48 bg-slate-900 border border-slate-700 p-2 text-white rounded mt-1"
                  placeholder="Nick"
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
                    addPlayer(newPlayerName, newPlayerNick, newPlayerRoom);
                    setNewPlayerName('');
                    setNewPlayerNick('');
                  }
                }}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center gap-2"
              >
                <Users size={16} /> ADD
              </button>
            </div>
          </NeonCard>

          {/* Player List */}
          <NeonCard>
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
               {filters.map(f => (
                 <button
                   key={f.id}
                   onClick={() => setActiveFilter(f.id)}
                   className={`px-3 py-1 rounded text-xs font-oxanium whitespace-nowrap ${activeFilter === f.id ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}
                 >
                   {f.label}
                 </button>
               ))}
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-slate-700 text-slate-400 font-oxanium text-xs">
                     <th className="p-3">NAME</th>
                     <th className="p-3">NICK</th>
                     <th className="p-3">ROOM</th>
                     <th className="p-3">STATUS</th>
                     <th className="p-3">SCORE</th>
                     <th className="p-3 text-right">ACTIONS</th>
                   </tr>
                 </thead>
                 <tbody>
                   {getFilteredPlayers().map((p) => (
                     <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                       <td className="p-3 text-white font-bold">
                         {editingPlayer?.id === p.id ? (
                           <input
                             className="bg-black border border-slate-600 p-1 text-white rounded w-full"
                             value={editingPlayer.name}
                             onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})}
                           />
                         ) : p.name}
                       </td>
                       <td className="p-3 text-slate-300">
                         {editingPlayer?.id === p.id ? (
                           <input
                             className="bg-black border border-slate-600 p-1 text-white rounded w-full"
                             value={editingPlayer.nick || ''}
                             onChange={e => setEditingPlayer({...editingPlayer, nick: e.target.value})}
                           />
                         ) : p.nick || '-'}
                       </td>
                       <td className="p-3 text-cyan-400 font-mono">
                         {editingPlayer?.id === p.id ? (
                           <select
                              className="bg-black border border-slate-600 p-1 text-white rounded w-full"
                              value={editingPlayer.room}
                              onChange={e => setEditingPlayer({...editingPlayer, room: e.target.value})}
                           >
                             {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                           </select>
                         ) : p.room}
                       </td>
                       <td className="p-3">
                         {editingPlayer?.id === p.id ? (
                            <select
                              className="bg-black border border-slate-600 p-1 text-white rounded w-full"
                              value={editingPlayer.status}
                              onChange={e => setEditingPlayer({...editingPlayer, status: e.target.value as any})}
                            >
                              <option value="active">Active</option>
                              <option value="qualified">Qualified</option>
                              <option value="eliminated">Eliminated</option>
                            </select>
                         ) : (
                           <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                             p.status === 'qualified' ? 'bg-green-900/50 text-green-400' :
                             p.status === 'eliminated' ? 'bg-red-900/50 text-red-400' :
                             'bg-blue-900/50 text-blue-400'
                           }`}>{p.status}</span>
                         )}
                       </td>
                       <td className="p-3 text-yellow-400 font-oxanium text-lg">{p.totalScore}</td>
                       <td className="p-3 text-right">
                         {editingPlayer?.id === p.id ? (
                           <div className="flex justify-end gap-2">
                             <button onClick={handleUpdatePlayer} className="p-1 bg-green-600 text-white rounded hover:bg-green-500"><Save size={16} /></button>
                             <button onClick={() => setEditingPlayer(null)} className="p-1 bg-slate-600 text-white rounded hover:bg-slate-500"><X size={16} /></button>
                           </div>
                         ) : (
                           <div className="flex justify-end gap-2">
                             <button onClick={() => setEditingPlayer(p)} className="p-1 text-slate-400 hover:text-cyan-400"><Edit size={16} /></button>
                             <button onClick={() => { if(confirm('Delete player?')) deletePlayer(p.id); }} className="p-1 text-slate-400 hover:text-red-400"><Trash size={16} /></button>
                           </div>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </NeonCard>
        </div>
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
            <h3 className="text-xl font-orbitron text-purple-400 mb-4">SPIN WHEEL (ROOM MODES)</h3>
            <p className="text-sm text-slate-400 mb-6">Select a room to spin for a random Game Mode.</p>

            <div className="flex gap-4 mb-8">
              <button onClick={() => spinRoomMode('A')} className="flex-1 py-4 bg-purple-900/40 border border-purple-500 rounded hover:bg-purple-800/60 text-white font-bold font-orbitron flex flex-col items-center gap-2">
                <Dices size={24} /> SPIN MODE ROOM A
              </button>
              <button onClick={() => spinRoomMode('B')} className="flex-1 py-4 bg-purple-900/40 border border-purple-500 rounded hover:bg-purple-800/60 text-white font-bold font-orbitron flex flex-col items-center gap-2">
                <Dices size={24} /> SPIN MODE ROOM B
              </button>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-bold text-white border-b border-slate-700 pb-2">ACTIVE MODES</h4>
               {['A', 'B'].map(r => (
                 <div key={r} className="flex justify-between items-center bg-black/30 p-3 rounded border border-slate-700">
                    <span className="text-slate-400">ROOM {r}</span>
                    <span className="text-purple-400 font-orbitron text-lg">{appState.activeRoomModes?.[r] || 'NORMAL'}</span>
                 </div>
               ))}
            </div>
          </NeonCard>

          <NeonCard>
            <h3 className="text-lg font-orbitron text-white mb-4">MANAGE WHEEL MODES</h3>

            {/* Add Mode */}
            <div className="bg-slate-900/50 p-3 rounded mb-4 border border-slate-700">
               <h4 className="text-xs text-slate-400 mb-2">ADD NEW MODE</h4>
               <div className="flex gap-2 mb-2">
                 <input
                    className="flex-1 bg-black border border-slate-600 p-2 text-white rounded text-sm"
                    placeholder="Mode Name (e.g. SNIPER ONLY)"
                    value={newModeName}
                    onChange={e => setNewModeName(e.target.value)}
                 />
                 <input
                    className="flex-1 bg-black border border-slate-600 p-2 text-white rounded text-sm"
                    placeholder="Description"
                    value={newModeDesc}
                    onChange={e => setNewModeDesc(e.target.value)}
                 />
               </div>
               <button
                  onClick={() => {
                     if(newModeName) {
                        addMode(newModeName, newModeDesc);
                        setNewModeName('');
                        setNewModeDesc('');
                     }
                  }}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded"
               >
                  ADD MODE
               </button>
            </div>

            {/* Mode List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {wheelModes.map(mode => (
                <div key={mode.id} className="bg-slate-900 border border-slate-800 p-3 rounded group relative">
                  {editingMode?.id === mode.id ? (
                     <div className="space-y-2">
                        <input
                           className="w-full bg-black border border-slate-600 p-1 text-white rounded text-sm"
                           value={editingMode.name}
                           onChange={e => setEditingMode({...editingMode, name: e.target.value})}
                        />
                        <input
                           className="w-full bg-black border border-slate-600 p-1 text-white rounded text-xs"
                           value={editingMode.description || ''}
                           onChange={e => setEditingMode({...editingMode, description: e.target.value})}
                        />
                        <div className="flex gap-2">
                           <button onClick={handleUpdateMode} className="flex-1 bg-green-900/50 text-green-400 text-xs py-1 rounded">SAVE</button>
                           <button onClick={() => setEditingMode(null)} className="flex-1 bg-slate-800 text-slate-400 text-xs py-1 rounded">CANCEL</button>
                        </div>
                     </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white text-sm">{mode.name}</div>
                          <div className="text-xs text-slate-500">{mode.description}</div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setEditingMode(mode)} className="text-slate-400 hover:text-cyan-400"><Edit size={14} /></button>
                           <button onClick={() => { if(confirm('Delete mode?')) deleteMode(mode.id); }} className="text-slate-400 hover:text-red-400"><Trash size={14} /></button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {wheelModes.length === 0 && <div className="text-center text-slate-600 text-xs py-4">No modes defined. Add one above.</div>}
            </div>
          </NeonCard>
        </div>
      )}
    </div>
  );
}
