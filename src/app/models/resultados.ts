export type GameCode = 'ahorcado' | 'mayor_menor' | 'flow_free' | 'preguntados_dbz' | 'escultor'
  | 'bloxorz' | 'river_run' | 'lightbot' | 'sokoban' | 'cube_crash' | 'cube_move' | 'neon_slide' | 'neon_shapes' | 'rayland' | 'circuito'
  | 'gemelos' | 'cerrar_circuito' | 'tangram' | 'anillos';

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Score {
  id: string;
  userId: string;
  gameCode: GameCode;
  points: number;
  durationSec?: number;
  createdAt: string;
  metaJson?: Record<string, unknown>;
}

export interface ScoreWithUser extends Score {
  userDisplayName: string;
  userAvatarUrl?: string;
}
