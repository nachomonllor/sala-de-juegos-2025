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
