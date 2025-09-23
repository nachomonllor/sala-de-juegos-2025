
import { AppUser } from '../models/user.models';

export const MOCK_USERS: AppUser[] = [
  {
    id: 'u1',
    firstName: 'Nacho',
    lastName: 'Monllor',
    email: 'nacho@example.com',
    age: 44,
    gamePlays: {
      'ahorcado': { sessions: 12, wins: 7, losses: 5, bestScore: 8, lastPlayedAt: '2025-09-21T22:10:00Z' },
      'mayor-menor': { sessions: 4, wins: 1, losses: 3 }
    }
  },
  {
    id: 'u2',
    firstName: 'Ariel',
    lastName: 'Pérez',
    email: 'ariel@example.com',
    gamePlays: {
      'preguntados': { sessions: 20, wins: 11, losses: 9, bestScore: 18 }
    }
  },
  {
    id: 'u3',
    firstName: 'Andrea',
    lastName: 'García',
    email: 'andrea@example.com',
    gamePlays: {
      'flowfree': { sessions: 9, wins: 9, losses: 0, bestScore: 100 }
    }
  }
];




// import { User } from "@supabase/supabase-js";

// const USUARIOS: User[] = [
//   {
//     firstName: 'Juan',
//     lastName: 'Pérez',
//     email: 'juan.perez@example.com',
//     gamePlays: {
//       Ahorcado: { '1': 100, '2': 150 },
//       Memoria: { '1': 200 }
//     }
//   },
//   {
//     firstName: 'María',
//     lastName: 'Gómez',
//     email: 'maria.gomez@example.com',
//     gamePlays: {
//       Ahorcado: { '1': 120, '2': 180 },
//       Puzzle: { '1': 80 }
//     }
//   },
//   {
//     firstName: 'Dave',
//     lastName: 'Mustaine',
//     email: 'dave.mustaine@mega.com',
//     gamePlays: {
//       Ahorcado: { '1': 400, '2': 180 },
//       Puzzle: { '1': 100 }
//     }
//   },
//   {
//     firstName: 'James',
//     lastName: 'Hetfield',
//     email: 'juan.het@hotmail.com',
//     gamePlays: {
//       Ahorcado: { '1': 400, '2': 180 },
//       Puzzle: { '1': 100 }
//     }
//   },
//   {
//     firstName: 'Ignacio',
//     lastName: 'monllor',
//     email: 'nachomonllor@hotmail.com',
//     gamePlays: {
//       Ahorcado: { '2': 400, '4': 180 },
//       Puzzle: { '1': 100 }
//     }
//   }

// ];
