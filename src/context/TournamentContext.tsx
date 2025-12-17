import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection, doc, setDoc, onSnapshot, updateDoc, query, Firestore
} from 'firebase/firestore';
import {
  signInAnonymously, onAuthStateChanged, signInWithCustomToken, Auth
} from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDb, appId } from '../lib/firebase';
import { Player, AppState, WheelMode } from '../types';

interface TournamentContextType {
  user: any;
  players: Player[];
  appState: AppState;
  wheelModes: WheelMode[];
  loading: boolean;
  isAdminMode: boolean; // Just a toggle for UI, real admin is guarded by route
  setStage: (stage: AppState['stage']) => Promise<void>;
  setViewerRoom: (room: string) => Promise<void>;
  addPlayer: (name: string, nick: string, room: string) => Promise<void>;
  updatePlayer: (id: string, data: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  updateScore: (playerId: string, gameIndex: number, score: number) => Promise<void>;
  runWheel: (room: string) => Promise<void>;
  spinRoomMode: (room: string) => Promise<void>;
  addMode: (name: string, description: string) => Promise<void>;
  updateMode: (id: string, data: Partial<WheelMode>) => Promise<void>;
  deleteMode: (id: string) => Promise<void>;
  advanceQualifiers: (dayRooms: string[]) => Promise<void>;
  advanceSemis: () => Promise<void>;
  getPlayersInRoom: (room: string) => Player[];
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [wheelModes, setWheelModes] = useState<WheelMode[]>([]);
  const [appState, setAppState] = useState<AppState>({
    stage: 'QUALIFIERS_D1',
    activeRoomViewer: '1'
  });
  const [loading, setLoading] = useState(true);
  const [isAdminMode] = useState(false); // Can be removed if not used

  // Firebase instances (populated after async init)
  const authRef = useRef<Auth | null>(null);
  const dbRef = useRef<Firestore | null>(null);

  // Auth & Init
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;

    const init = async () => {
      try {
        // Wait for Firebase to be initialized
        const [auth, db] = await Promise.all([getFirebaseAuth(), getFirebaseDb()]);
        authRef.current = auth;
        dbRef.current = db;

        if (typeof (window as any).__initial_auth_token !== 'undefined' && (window as any).__initial_auth_token) {
          await signInWithCustomToken(auth, (window as any).__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }

        // Set up auth state listener after Firebase is ready
        unsubAuth = onAuthStateChanged(auth, setUser);
      } catch (e) {
        console.error("Auth error", e);
        setLoading(false);
      }
    };
    init();

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // Data Sync
  useEffect(() => {
    if (!user || !dbRef.current) return;
    const db = dbRef.current;

    // Listen to Players
    const qPlayers = query(collection(db, 'artifacts', appId, 'public', 'data', 'players'));
    const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
      const pData = snapshot.docs.map(d => d.data() as Player);
      setPlayers(pData);
      setLoading(false);
    });

    // Listen to Wheel Modes
    const qModes = query(collection(db, 'artifacts', appId, 'public', 'data', 'modes'));
    const unsubModes = onSnapshot(qModes, (snapshot) => {
      const mData = snapshot.docs.map(d => d.data() as WheelMode);
      setWheelModes(mData);
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
      unsubModes();
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
  const addPlayer = async (name: string, nick: string, room: string) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      nick,
      room,
      scores: [],
      totalScore: 0,
      status: 'active'
    };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', newPlayer.id), newPlayer);
  };

  const updatePlayer = async (id: string, data: Partial<Player>) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', id), data);
  };

  const deletePlayer = async (id: string) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
    // Note: deleting doc is not exposed in default_api, but context likely needs it.
    // However, the memory says "delete_file" is a tool. I need to use firebase deleteDoc.
    // I can import deleteDoc.
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', id));
  };

  const updateScore = async (playerId: string, gameIndex: number, score: number) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
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
    if (!dbRef.current) return;
    const db = dbRef.current;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { stage });
  };

  const setViewerRoom = async (room: string) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { activeRoomViewer: room });
  };

  const runWheel = async (room: string) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
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

  const spinRoomMode = async (room: string) => {
    if (!dbRef.current || wheelModes.length === 0) return;
    const db = dbRef.current;

    // Pick random mode
    const randomMode = wheelModes[Math.floor(Math.random() * wheelModes.length)];

    // Update app state
    const currentModes = appState.activeRoomModes || {};
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), {
      activeRoomModes: { ...currentModes, [room]: randomMode.name }
    });
  };

  const addMode = async (name: string, description: string) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
    const id = crypto.randomUUID();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'modes', id), { id, name, description });
  };

  const updateMode = async (id: string, data: Partial<WheelMode>) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'modes', id), data);
  };

  const deleteMode = async (id: string) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'modes', id));
  };

  const advanceQualifiers = async (dayRooms: string[]) => {
    if (!dbRef.current) return;
    const db = dbRef.current;
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
    if (!dbRef.current) return;
    const db = dbRef.current;
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
      user, players, appState, wheelModes, loading, isAdminMode,
      setStage, setViewerRoom, addPlayer, updatePlayer, deletePlayer, updateScore, runWheel, spinRoomMode,
      addMode, updateMode, deleteMode,
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
