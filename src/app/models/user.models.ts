export type GameKey = 'ahorcado' | 'mayor-menor' | 'preguntados' | 'flowfree';

export interface GameSessions {
  sessions: number;
  wins: number;
  losses: number;
  bestScore?: number;
  lastPlayedAt?: string; // ISO string
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  avatarUrl?: string;
  createdAt?: string;
  gamePlays?: Partial<Record<GameKey, GameSessions>>;
}







// //export type GameSessions = Record<number, number>;
// export type GamePlays    = Record<string, GameSessions>;

// // Ajustá la forma de GameSessions a tu necesidad real
// export interface GameSessions {
//   plays: number;
//   lastPlayed?: string; // ISO string opcional
// }

// export interface AppUser {
//   id?:        string; // auth.users.id (puede ser indefinido mientras se crea)
//   firstName:  string;
//   lastName:   string;
//   email:      string;
//   password?:  string; // solo para formularios, NO persistir
//   // Datos de juegos (opcional). Si no lo usás, podés quitarlo.
//   gamePlays?: Record<string, GameSessions>;
// }

// export interface AppUserProfile {
//   id: string;          // = auth.users.id (uuid)
//   firstName: string;
//   lastName: string;
//   email: string;
//   gamePlays?: Record<string, GameSessions>;
// }




// export interface User {
//   id?:        string;
//   firstName:  string;
//   lastName:   string;
//   email:      string;
//   password?:  string;
// }

// export interface AppUser {
//   id?:        string;       // auth.users.id
//   firstName:  string;
//   lastName:   string;
//   email:      string;
//   password?:  string;       // 👈 sólo para el formulario, no se guarda en DB propia
// }



// export interface User {
//   id?:        string;
//   firstName:  string;
//   lastName:   string;
//   email:      string;
//   password?:  string;
//   gamePlays:  GamePlays;
// }

// export interface GameSessions {
//   [level: string]: number; // p.ej. { '1': 100, '2': 150 }
// }

// export interface User {
//   firstName: string;
//   lastName:  string;
//   email:     string;
//   gamePlays: Record<string, GameSessions>; // p.ej. { Ahorcado: {...}, Memoria: {...} }
// }
