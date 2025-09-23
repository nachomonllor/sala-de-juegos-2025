
// src/app/services/users.service.tsimport { from, map } from 'rxjs';
import { SupabaseService, type Profile } from './supabase.service';
import { AppUser } from '../models/user.models';
import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_USERS } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private supa: SupabaseService) { }

   getUsers(): Observable<AppUser[]> {
    // Simula latencia de red
    return of(MOCK_USERS).pipe(delay(300));
  }

  // getUsers() {
  //   // from() porque selectProfiles() retorna una Promise
  //   return from(this.supa.selectProfiles()).pipe(
  //     map(({ data, error }) => {
  //       if (error) throw error;
  //       return (data ?? []).map((row: any) => {
  //         const u: AppUser = {
  //           id: row.id,
  //           firstName: row.first_name,
  //           lastName: row.last_name,
  //           email: row.email,
  //           gamePlays: (row.game_plays ?? {}) as Record<string, GameSessions>,
  //         };
  //         return u;
  //       });
  //     })
  //   );
  // }

  // --- Métodos que quizá ya estabas usando ---
  listProfiles$(): Observable<Profile[]> {
    return from(this.supa.listProfiles());
  }

  getProfile$(uid: string): Observable<Profile | null> {
    return from(this.supa.getProfile(uid));
  }

  upsertMyProfile(uid: string, displayName: string): Observable<void> {
    return from(this.supa.upsertProfile(uid, displayName));
  }


}



// import { Injectable } from '@angular/core';
// import { from, Observable } from 'rxjs';
// import { SupabaseService, type Profile } from './supabase.service';

// @Injectable({ providedIn: 'root' })
// export class UsersService {
//   constructor(private supa: SupabaseService) {}

//   listProfiles$(): Observable<Profile[]> {
//     return from(this.supa.listProfiles());
//   }

//   getProfile$(uid: string): Observable<Profile | null> {
//     return from(this.supa.getProfile(uid));
//   }

//   upsertMyProfile(uid: string, displayName: string): Observable<void> {
//     return from(this.supa.upsertProfile(uid, displayName));
//   }
// }


  // // --- Helper de mapeo Profile -> User (ajustá según tu modelo User) ---
  // private toUser(p: Profile): User {
  //   const email = p.email ?? '';
  //   const display = (p.display_name ?? '').trim();

  //   // Si no hay display_name, usamos el "usuario" del email como firstName
  //   const [firstName, ...rest] = display
  //     ? display.split(/\s+/)
  //     : [email.split('@')[0] || ''];

  //   const lastName = rest.join(' ');

  //   const gamePlays: Record<string, GameSessions> = {}; // default vacío (ajustá si tenés datos)

  //   // ⚠️ Si tu interfaz User tiene más campos (id, role, etc.), agregalos acá.
  //   return { firstName, lastName, email, gamePlays };
  // }

  // Lee de una tabla "profiles" que referencia a auth.users(id)
  // getUsers() {
  //   return from(
  //     this.supa.client
  //       .from('profiles')
  //       .select('id, first_name, last_name, email, game_plays')
  //       .order('last_name', { ascending: true })
  //   ).pipe(
  //     map(({ data, error }) => {
  //       if (error) throw error;
  //       return (data ?? []).map(row => {
  //         const u: AppUser = {
  //           id: row.id,
  //           firstName: row.first_name,
  //           lastName: row.last_name,
  //           email: row.email,
  //           gamePlays: (row.game_plays ?? {}) as Record<string, GameSessions>,
  //         };
  //         return u;
  //       });
  //     })
  //   );
  // }




