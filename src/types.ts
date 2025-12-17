export type Player = {
  id: string;
  name: string;
  nick?: string; // Player nickname/alias
  room: string; // "1"-"6", "A", "B", "FINAL"
  scores: number[]; // Array skor per game
  totalScore: number;
  status: 'active' | 'eliminated' | 'qualified';
  wheelEffect?: {
    type: 'REVERSE' | 'DOUBLE' | 'BOOM' | 'NONE';
    value: number; // e.g., 1.1 (10%), 2.0 (2x), 0.9 (-10%)
    desc: string;
  };
};

export type Stage = 'QUALIFIERS_D1' | 'QUALIFIERS_D2' | 'SEMIFINALS' | 'FINALS';

export type WheelMode = {
  id: string;
  name: string;
  description?: string;
};

export type AppState = {
  stage: Stage;
  activeRoomViewer: string; // Room yang sedang dilihat viewer
  activeRoomModes?: Record<string, string>; // Active game modes per room (e.g., { 'A': 'NORMAL', 'B': 'DOUBLE' })
};
