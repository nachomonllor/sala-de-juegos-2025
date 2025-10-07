
// Juegos soportados
export type GameCode = 'ahorcado' | 'mayor_menor' | 'flow_free' | 'preguntados_dbz';

// Perfil del usuario (vincula con auth.users de Supabase)
export interface Profile {
  id: string;              // = auth.user.id
  displayName: string;
  avatarUrl?: string;
  createdAt: string;       // ISO
}

// Registro de puntuación (una partida)
export interface Score {
  id: string;              // uuid
  userId: string;          // = Profile.id
  gameCode: GameCode;
  points: number;          // más es mejor
  durationSec?: number;    // opcional
  createdAt: string;       // ISO
  metaJson?: Record<string, unknown>; // extras por juego
}

// Para el listado/leaderboard
export interface ScoreWithUser extends Score {
  userDisplayName: string;
  userAvatarUrl?: string;
}
