import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, setDoc, onSnapshot, updateDoc, query
} from 'firebase/firestore';
import {
  signInAnonymously, onAuthStateChanged, signInWithCustomToken
} from 'firebase/auth';
import { auth, db, appId } from '../lib/firebase';
import { Player, AppState } from '../types';

interface TournamentContextType {
  user: any;
  players: Player[];
  appState: AppState;
  loading: boolean;
  isAdminMode: boolean; // Just a toggle for UI, real admin is guarded by route
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

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [appState, setAppState] = useState<AppState>({
    stage: 'QUALIFIERS_D1',
    activeRoomViewer: '1'
  });
  const [loading, setLoading] = useState(true);
  const [isAdminMode] = useState(false); // Can be removed if not used

  // Auth & Init
  useEffect(() => {
    const init = async () => {
      try {
        if (typeof (window as any).__initial_auth_token !== 'undefined' && (window as any).__initial_auth_token) {
          await signInWithCustomToken(auth, (window as any).__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth error", e);
      }
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Data Sync
  useEffect(() => {
    if (!user) return;

    // Listen to Players
    const qPlayers = query(collection(db, 'artifacts', appId, 'public', 'data', 'players'));
    const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
      const pData = snapshot.docs.map(d => d.data() as Player);
      setPlayers(pData);
      setLoading(false);
    });

    // Listen to App State
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    const unsubState = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setAppState(snap.data() as AppState);
      } else {
        // Init default state if not exists
        // Only admin should ideally do this, but for robustness:
        // setDoc(docRef, { stage: 'QUALIFIERS_D1', activeRoomViewer: '1' });
      }
    });

    return () => {
      unsubPlayers();
      unsubState();
    };
  }, [user]);

  // Logic Helpers
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
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', newPlayer.id), newPlayer);
  };

  const updateScore = async (playerId: string, gameIndex: number, score: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newScores = [...player.scores];
    newScores[gameIndex] = score;

    const dummyPlayer = { ...player, scores: newScores };
    const total = calculateTotal(dummyPlayer);

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId), {
      scores: newScores,
      totalScore: total
    });
  };

  const setStage = async (stage: AppState['stage']) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { stage });
  };

  const setViewerRoom = async (room: string) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { activeRoomViewer: room });
  };

  const runWheel = async (room: string) => {
    const roomPlayers = getPlayersInRoom(room);
    if (roomPlayers.length === 0) return;

    const batchPromises = roomPlayers.map(p =>
      updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', p.id), { wheelEffect: null })
    );
    await Promise.all(batchPromises);

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

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', luckyPlayer.id), {
      wheelEffect: effectData
    });

    const lastPlace = roomPlayers[roomPlayers.length - 1];
    if (lastPlace.id !== luckyPlayer.id) {
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', lastPlace.id), {
        wheelEffect: { type: 'REVERSE', value: 1.1, desc: 'REVERSE (+10%)' }
      });
    }
  };

  const advanceQualifiers = async (dayRooms: string[]) => {
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
