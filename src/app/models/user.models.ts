export type GameSessions = Record<number, number>;
export type GamePlays    = Record<string, GameSessions>;

export interface User {
  id?:        string;
  firstName:  string;
  lastName:   string;
  email:      string;
  password?:  string;
  gamePlays:  GamePlays;
}

// export interface GameSessions {
//   [level: string]: number; // p.ej. { '1': 100, '2': 150 }
// }

// export interface User {
//   firstName: string;
//   lastName:  string;
//   email:     string;
//   gamePlays: Record<string, GameSessions>; // p.ej. { Ahorcado: {...}, Memoria: {...} }
// }
