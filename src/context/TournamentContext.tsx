import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, setDoc, onSnapshot, updateDoc, query
} from 'firebase/firestore';
import {
  signInAnonymously, onAuthStateChanged, signInWithCustomToken
} from 'firebase/auth';
import { auth, db, appId, isDemoMode } from '../lib/firebase';
import { Player, AppState } from '../types';

interface TournamentContextType {
  user: any;
  players: Player[];
  appState: AppState;
  loading: boolean;
  isAdminMode: boolean;
  setStage: (stage: AppState['stage']) => Promise<void>;
  setViewerRoom: (room: string) => Promise<void>;
  addPlayer: (name: string, room: string) => Promise<void>;
  updateScore: (playerId: string, gameIndex: number, score: number) => Promise<void>;
  runWheel: (room: string) => Promise<void>;
  advanceQualifiers: (dayRooms: string[]) => Promise<void>;
  advanceSemis: () => Promise<void>;
  getPlayersInRoom: (room: string) => Player[];
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// MOCK DATA FOR DEMO MODE
const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'CyberWolf', room: '1', scores: [100, 150, 200], totalScore: 450, status: 'active' },
  { id: '2', name: 'NeonRider', room: '1', scores: [120, 130, 210], totalScore: 460, status: 'active' },
  { id: '3', name: 'Glitch01', room: '1', scores: [90, 80, 100], totalScore: 270, status: 'active' },
  { id: '4', name: 'Viper', room: '2', scores: [200, 200, 200], totalScore: 600, status: 'active' },
];

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [appState, setAppState] = useState<AppState>({
    stage: 'QUALIFIERS_D1',
    activeRoomViewer: '1'
  });
  const [loading, setLoading] = useState(true);
  const [isAdminMode] = useState(false);

  // Auth & Init
  useEffect(() => {
    if (isDemoMode) {
      console.log("Demo Mode: Skipping Firebase Auth");
      setUser({ uid: 'demo-user', isAnonymous: true });
      setPlayers(MOCK_PLAYERS);
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        if (typeof (window as any).__initial_auth_token !== 'undefined' && (window as any).__initial_auth_token) {
          await signInWithCustomToken(auth, (window as any).__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth error", e);
        // Fallback to demo mode on error to prevent blank screen
        setUser({ uid: 'fallback-user' });
        setPlayers(MOCK_PLAYERS);
        setLoading(false);
      }
    };
    init();
    return onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
  }, []);

  // Data Sync
  useEffect(() => {
    if (isDemoMode || !user) return;

    // Listen to Players
    const qPlayers = query(collection(db, 'artifacts', appId, 'public', 'data', 'players'));
    const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
      const pData = snapshot.docs.map(d => d.data() as Player);
      setPlayers(pData);
      setLoading(false);
    }, (err) => {
       console.error("Firestore Error (Players):", err);
       setPlayers(MOCK_PLAYERS); // Fallback
       setLoading(false);
    });

    // Listen to App State
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    const unsubState = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setAppState(snap.data() as AppState);
      }
    }, (err) => {
      console.error("Firestore Error (Config):", err);
    });

    return () => {
      unsubPlayers();
      unsubState();
    };
  }, [user]);

  // Logic Helpers (Shared between Demo and Real)
  const calculateTotal = (player: Player) => {
    const rawScore = player.scores.reduce((a, b) => a + b, 0);
    let finalScore = rawScore;

    if (player.wheelEffect?.type === 'BOOM') {
      if (player.wheelEffect.value !== 1) {
        finalScore = Math.floor(rawScore * player.wheelEffect.value);
      }
    } else if (player.wheelEffect?.type === 'DOUBLE') {
      if (player.scores.length > 0) {
        const max = Math.max(...player.scores);
        finalScore = rawScore + max;
      }
    }
    return finalScore;
  };

  const getPlayersInRoom = (room: string) => {
    const roomPlayers = players.filter(p => p.room === room);
    return roomPlayers.sort((a, b) => calculateTotal(b) - calculateTotal(a));
  };

  // Actions
  const addPlayer = async (name: string, room: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      room,
      scores: [],
      totalScore: 0,
      status: 'active'
    };
    if (isDemoMode) {
      setPlayers(prev => [...prev, newPlayer]);
    } else {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', newPlayer.id), newPlayer);
    }
  };

  const updateScore = async (playerId: string, gameIndex: number, score: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newScores = [...player.scores];
    newScores[gameIndex] = score;
    const dummyPlayer = { ...player, scores: newScores };
    const total = calculateTotal(dummyPlayer);

    if (isDemoMode) {
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, scores: newScores, totalScore: total } : p));
    } else {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId), {
        scores: newScores,
        totalScore: total
      });
    }
  };

  const setStage = async (stage: AppState['stage']) => {
    if (isDemoMode) {
      setAppState(prev => ({ ...prev, stage }));
    } else {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { stage });
    }
  };

  const setViewerRoom = async (room: string) => {
    if (isDemoMode) {
      setAppState(prev => ({ ...prev, activeRoomViewer: room }));
    } else {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { activeRoomViewer: room });
    }
  };

  const runWheel = async (room: string) => {
    const roomPlayers = getPlayersInRoom(room);
    if (roomPlayers.length === 0) return;

    // Reset logic omitted for brevity in Demo, just apply new effect
    const effectType = ['DOUBLE', 'BOOM'][Math.floor(Math.random() * 2)];
    const luckyIndex = Math.floor(Math.random() * roomPlayers.length);
    const luckyPlayer = roomPlayers[luckyIndex];

    let effectData: Player['wheelEffect'];

    if (effectType === 'DOUBLE') {
      effectData = { type: 'DOUBLE', value: 2, desc: 'DOUBLE CHANCE (Best x2)' };
    } else {
      const isGood = Math.random() > 0.4;
      if (isGood) effectData = { type: 'BOOM', value: 1.15, desc: 'BOOM (+15%)' };
      else effectData = { type: 'BOOM', value: 0.90, desc: 'BOOM (-10%)' };
    }

    if (isDemoMode) {
      setPlayers(prev => prev.map(p => {
        if (p.room !== room) return p;
        if (p.id === luckyPlayer.id) return { ...p, wheelEffect: effectData };
        // Simple reset for others
        return { ...p, wheelEffect: undefined };
      }));
    } else {
       // Real implementation remains
       const batchPromises = roomPlayers.map(p =>
        updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', p.id), { wheelEffect: null })
      );
      await Promise.all(batchPromises);

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', luckyPlayer.id), {
        wheelEffect: effectData
      });
    }
  };

  const advanceQualifiers = async (dayRooms: string[]) => {
    // Demo implementation simplified
    if (isDemoMode) {
      alert("Simulating Advancement (Demo Mode)");
      return;
    }
    // Real logic
    for (const r of dayRooms) {
      const sorted = getPlayersInRoom(r);
      for (let i = 0; i < 2; i++) {
        if (sorted[i]) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', sorted[i].id), {
            status: 'qualified',
            room: ['1','2','3'].includes(r) ? 'A' : 'B',
            scores: [],
            totalScore: 0,
            wheelEffect: null
          });
        }
      }
      for (let i = 2; i < sorted.length; i++) {
        if (sorted[i]) {
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', sorted[i].id), {
            status: 'eliminated'
          });
        }
      }
    }
  };

  const advanceSemis = async () => {
    if (isDemoMode) {
      setAppState(prev => ({ ...prev, stage: 'FINALS' }));
      return;
    }
    for (const r of ['A', 'B']) {
      const sorted = getPlayersInRoom(r);
      for (let i = 0; i < 3; i++) {
        if (sorted[i]) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', sorted[i].id), {
            status: 'qualified',
            room: 'FINAL',
            scores: [],
            totalScore: 0,
            wheelEffect: null
          });
        }
      }
      for (let i = 3; i < sorted.length; i++) {
        if (sorted[i]) {
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', sorted[i].id), {
            status: 'eliminated'
          });
        }
      }
    }
    setStage('FINALS');
  };

  return (
    <TournamentContext.Provider value={{
      user, players, appState, loading, isAdminMode,
      setStage, setViewerRoom, addPlayer, updateScore, runWheel,
      advanceQualifiers, advanceSemis, getPlayersInRoom
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
