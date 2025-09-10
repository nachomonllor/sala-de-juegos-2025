
// src/app/services/users.service.ts
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { GameSessions, User } from '../models/user.models';

// Define UIUser interface
export interface UIUser {
  firstName: string;
  lastName: string;
  email: string;
  gamePlays: Record<string, GameSessions>;
}

// Helper function to split names
function splitName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  displayName: string | null | undefined
): { firstName: string; lastName: string } {
  if (firstName || lastName) {
    return {
      firstName: firstName ?? '',
      lastName: lastName ?? '',
    };
  }
  if (displayName) {
    const parts = displayName.split(' ');
    return {
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ') ?? '',
    };
  }
  return { firstName: '', lastName: '' };
}

// export interface Profile {
//   id: string;
//   display_name: string | null;
//   role: 'user' | 'admin';
//   created_at: string;
//   email?: string | null;
// }

export interface Profile {
  id: string;
  display_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  game_plays?: Record<string, GameSessions> | null;
  role?: 'user' | 'admin';
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private supa: SupabaseService) { }

  getUsers(): Observable<User[]> {
    return from(this.supa.listProfiles()).pipe(
      map((profiles: any[]) =>
        (profiles ?? []).map((p: any) => {
          const { firstName, lastName } = splitName(p.first_name, p.last_name, p.display_name);
          return {
            firstName,
            lastName,
            email: p.email ?? '',
            gamePlays: (p.game_plays ?? {}) as Record<string, GameSessions>,
          } as User;
        })
      )
    );
  }

  getMyProfile$(uid: string): Observable<Profile | null> {
    return from(this.supa.getProfile(uid)).pipe(
      map((data) =>
        data
          ? {
            id: data.id,
            display_name: data.display_name ?? null,
            role: ('role' in data && data.role ? data.role : 'user') as 'user' | 'admin',
            created_at: data.created_at,
          }
          : null
      )
    );
  }

  upsertMyProfile(uid: string, displayName: string) {
    return from(this.supa.upsertProfile(uid, displayName)).pipe(map(() => void 0));
  }

  listProfiles$(): Observable<Profile[]> {
    return from(this.supa.listProfiles()).pipe(
      map((profiles: any[]) =>
        (profiles ?? []).map((p: any) => ({
          id: p.id,
          display_name: p.display_name ?? null,
          role: (p.role ?? 'user') as 'user' | 'admin',
          created_at: p.created_at,
          email: p.email ?? null,
        }))
      )
    );
  }

}




// import { Injectable } from '@angular/core';
// import { Firestore, collection, collectionData } from '@angular/fire/firestore';
// import { Observable } from 'rxjs';
// import { User } from './models/user.models';

// @Injectable({ providedIn: 'root' })

// export class UsersService {
//   constructor(private firestore: Firestore) {}

//   getUsers(): Observable<User[]> {
//     const usersRef = collection(this.firestore, 'users');
//     return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
//   }
// }


