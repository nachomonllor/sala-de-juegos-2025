export type GameCode = 'ahorcado' | 'mayor_menor' | 'flow_free' | 'preguntados_dbz' | 'escultor'
  | 'bloxorz' | 'river_run' | 'lightbot' | 'sokoban' | 'cube_crash' | 'cube_move' | 'neon_slide' | 'neon_shapes';

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







// export type GameCode = 'ahorcado' | 'mayor_menor' | 'flow_free' | 'preguntados_dbz' | 'escultor';

// export interface Profile {
//   id: string;
//   displayName: string;
//   avatarUrl?: string;
//   createdAt: string;
// }

// export interface Score {
//   id: string;
//   userId: string;
//   gameCode: GameCode;
//   points: number;
//   durationSec?: number;
//   createdAt: string;
//   metaJson?: Record<string, unknown>;
// }

// export interface ScoreWithUser extends Score {
//   userDisplayName: string;
//   userAvatarUrl?: string;
// }




// // Juegos soportados
// export type GameCode = 'ahorcado' | 'mayor_menor' | 'flow_free' | 'preguntados_dbz';

// // Perfil del usuario (vincula con auth.users de Supabase)
// export interface Profile {
//   id: string;              // = auth.user.id
//   displayName: string;
//   avatarUrl?: string;
//   createdAt: string;       // ISO
// }

// // Registro de puntuación (una partida)
// export interface Score {
//   id: string;              // uuid
//   userId: string;          // = Profile.id
//   gameCode: GameCode;
//   points: number;          // más es mejor
//   durationSec?: number;    // opcional
//   createdAt: string;       // ISO
//   metaJson?: Record<string, unknown>; // extras por juego
// }

// // Para el listado/leaderboard
// export interface ScoreWithUser extends Score {
//   userDisplayName: string;
//   userAvatarUrl?: string;
// }
