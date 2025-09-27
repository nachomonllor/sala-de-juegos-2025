
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import type { Session, User as SupaUser, AuthChangeEvent } from '@supabase/supabase-js';

export type User = SupaUser;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user$ = new BehaviorSubject<User | null>(null);
  public readonly user$ = this._user$.asObservable();

  private unsubscribeAuthChange?: () => void;

  constructor(private readonly supa: SupabaseService) {
    this.init();
  }

  private async init(): Promise<void> {
    const session = await this.supa.getSession();
    this._user$.next(session?.user ?? null);

    this.unsubscribeAuthChange = this.supa.onAuthChange(
      (_event: AuthChangeEvent, newSession: Session | null) => {
        this._user$.next(newSession?.user ?? null);
      }
    );
  }

  // // AuthService (ejemplo)
  // async ensureProfile(user: any, patch?: { first_name?: string; last_name?: string; birth_date?: string }) {
  //   const up = {
  //     id: user.id,
  //     email: user.email ?? null,
  //     first_name: patch?.first_name ?? null,
  //     last_name: patch?.last_name ?? null,
  //     birth_date: patch?.birth_date ?? null, // si NO existe, quítalo
  //   };
  //   const { data, error } = await this.client
  //     .from('profiles')
  //     .upsert(up, { onConflict: 'id' })
  //     .select('*')            // <- no listar columnas inexistentes
  //     .single();
  //   if (error) throw error;
  //   return data;
  // }

  // --- Nombres “propios” que ya tenías ---
  async login(email: string, password: string) {
    // Si quieres, puedes delegar en signIn:
    return this.signIn(email, password);
  }

  async register(email: string, password: string) {
    // Si quieres, puedes delegar en signUp:
    return this.signUp(email, password);
  }

  async logout(): Promise<void> {
    await this.supa.signOut();
  }

  // // --- Aliases para compatibilidad con el componente ---
  // // Devuelven lo que devuelva tu SupabaseService (normalmente { data, error })
  // async signIn(email: string, password: string) {
  //   return this.supa.signInWithPassword(email, password);
  // }

  // async signUp(email: string, password: string) {
  //   return this.supa.signUp(email, password);
  // }

  // --- Aliases para compatibilidad con el componente ---
  // Devuelven exactamente { data, error } como espera tu LoginComponent
  async signIn(email: string, password: string) {
    try {
      const data = await this.supa.signInWithPassword(email, password); // devuelve { user, session }
      return { data, error: null as any };
    } catch (err: any) {
      return { data: null as any, error: err };
    }
  }

  async signUp(email: string, password: string) {
    try {
      const data = await this.supa.signUp(email, password);
      return { data, error: null as any };
    } catch (err: any) {
      return { data: null as any, error: err };
    }
  }

  // --- NUEVO: exponer el cliente para poder usar .from(...) ---
  get client() {
    return this.supa.client; // asegúrate de exponer 'client' en SupabaseService (abajo)
  }

  // En src/app/services/auth.service.ts
// dentro de export class AuthService { ... }

async ensureProfile(
  user: User,
  opts: { name?: string; age?: number | null; avatar_url?: string | null } = {}
): Promise<void> {
  // Partimos el "name" en nombre y apellido (si existe)
  const full = (opts.name ?? '').trim();
  const [first, ...rest] = full.split(/\s+/);
  const first_name = first || null;
  const last_name = rest.join(' ') || null;

  // Fallback razonable para display_name
  const display_name = full || user.email || null;

  // Armamos el payload; ignoramos "age" salvo que tengas esa columna
  const payload: any = {
    id: user.id,
    email: user.email ?? null,
    first_name,
    last_name,
    display_name,
   // avatar_url: opts.avatar_url ?? null,
    updated_at: new Date().toISOString(),
  };

  // Upsert en 'profiles'
  const { error } = await this.client
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (error) throw error;
}

}






// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { SupabaseService } from './supabase.service';
// import type {
//   Session,
//   User as SupaUser,
//   AuthChangeEvent
// } from '@supabase/supabase-js';

// export type User = SupaUser;

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private readonly _user$ = new BehaviorSubject<User | null>(null);
//   public readonly user$ = this._user$.asObservable();

//   private unsubscribeAuthChange?: () => void;

//   constructor(private readonly supa: SupabaseService) {
//     this.init();
//   }

//   private async init(): Promise<void> {
//     const session = await this.supa.getSession();
//     this._user$.next(session?.user ?? null);

//     this.unsubscribeAuthChange = this.supa.onAuthChange(
//       (_event: AuthChangeEvent, newSession: Session | null) => {
//         this._user$.next(newSession?.user ?? null);
//       }
//     );
//   }

//   async login(email: string, password: string): Promise<void> {
//     await this.supa.signInWithPassword(email, password);
//     // onAuthChange actualiza user$ automáticamente
//   }

//   async register(email: string, password: string): Promise<void> {
//     await this.supa.signUp(email, password);
//     // Dependiendo de tu política, quizá quieras forzar login luego del signUp:
//     // await this.login(email, password);
//   }

//   async logout(): Promise<void> {
//     await this.supa.signOut();
//   }
// }






// // src/app/services/auth.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import type { Session, User as SupaUser, AuthChangeEvent } from '@supabase/supabase-js';
// import { SupabaseService } from './supabase.service';

// export type User = SupaUser;

// @Injectable({ providedIn: 'root' })
// export class AuthService {

//   private readonly _user$ = new BehaviorSubject<SupaUser | null>(null);

//   constructor(private readonly supa: SupabaseService) {
//     this.init();
//   }

//   private async init(): Promise<void> {
//     try {
//       const session = await this.supa.getSession();
//       this._user$.next(session?.user ?? null);

//       // Mantener sincronizado el usuario ante cambios de sesión
//       this.supa.onAuthChange(
//         (_event: AuthChangeEvent, newSession: Session | null) => {
//           this._user$.next(newSession?.user ?? null);
//         }
//       );
//     } catch (e) {
//       console.error('AuthService init error:', e);
//       this._user$.next(null);
//     }
//   }

//   // ==== Observables / getters ====
//   get user$(): Observable<SupaUser | null> { return this._user$.asObservable(); }
//   get user(): SupaUser | null { return this._user$.value; }
//   get session(): Session | null { return this.supa.session; }
//   isLoggedIn(): boolean { return this.supa.isLoggedIn; }

//   // ==== Acciones de autenticación ====
//   async signIn(email: string, password: string): Promise<{ user: SupaUser }> {
//     const { user } = await this.supa.signIn(email, password);
//     this._user$.next(user ?? null); // sincroniza inmediatamente
//     return { user };
//   }

//   async signOut(): Promise<void> {
//     await this.supa.signOut();
//     this._user$.next(null);
//   }

//   // ==== Helpers de conveniencia ====
//   get uid(): string | null { return this.user?.id ?? null; }
//   get email(): string | null { return this.user?.email ?? null; }

//   // async signOut(): Promise<void> {
//   //   await this.supa.signOut();
//   //   this._user$.next(null);
//   // }

//   // 👇 Agregá este alias para compatibilidad
//   logout(): Promise<void> {
//     return this.signOut();
//   }
  
// }










// // src/app/services/auth.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { SupabaseService } from './supabase.service';

// export interface User { email: string | null; uid: string; }

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private userSubject = new BehaviorSubject<User | null>(null);
//   user$: Observable<User | null> = this.userSubject.asObservable();

//   constructor(private supa: SupabaseService) {
//     // this.bootstrap();

//     // 1) En el constructor, dentro de onAuthChange:
//     this.supa.onAuthChange((_e, s) => {
//       const u = s?.user ? { email: s.user.email ?? null, uid: s.user.id } : null;
//       this.userSubject.next(u);
//     });
//   }

//   private async bootstrap() {
//     const { data } = await this.supa.getSession();
//     // const u = data.session?.user ? { email: data.session.user.email, uid: data.session.user.id } : null;
//     // this.userSubject.next(u);

//     // 2) En bootstrap()/bootstrapSession():
//     const su = data.session?.user;
//     const u = su ? { email: su.email ?? null, uid: su.id } : null;
//     this.userSubject.next(u);

//   }

//   /*
//   Cuando uses el email (por ejemplo, al guardar resultados o mandar mensajes), convertí null a string:
//   const email = u.email ?? '';
//   */

//   login(email: string, password: string) {
//     return this.supa.signIn(email, password);
//   }

//   register(email: string, password: string, displayName?: string) {
//     return this.supa.signUp(email, password, displayName);
//   }

//   logout() {
//     return this.supa.signOut();
//   }
// }






// // // src/app/services/auth.service.ts
// // import { Injectable } from '@angular/core';
// // import {
// //   Auth,
// //   authState,
// //   signInWithEmailAndPassword,
// //   createUserWithEmailAndPassword,
// //   signOut,
// //   User as FirebaseUser
// // } from '@angular/fire/auth';
// // import { BehaviorSubject, Observable } from 'rxjs';

// // export interface User {
// //   email: string;
// //   uid: string;
// // }

// // @Injectable({ providedIn: 'root' })
// // export class AuthService {
// //   private userSubject = new BehaviorSubject<User | null>(null);
// //   user$: Observable<User | null> = this.userSubject.asObservable();

// //   constructor(private afAuth: Auth) {
// //     //  ← Aquí nos suscribimos al estado de Firebase Auth
// //     authState(this.afAuth).subscribe((fbUser: FirebaseUser | null) => {
// //       if (fbUser) {
// //         this.userSubject.next({ email: fbUser.email || '', uid: fbUser.uid });
// //       } else {
// //         this.userSubject.next(null);
// //       }
// //     });
// //   }

// //   /** Envía las credenciales a Firebase */
// //   async login(email: string, password: string): Promise<void> {
// //     await signInWithEmailAndPassword(this.afAuth, email, password);
// //   }

// //   /** Crea usuario + login */
// //   async register(email: string, password: string): Promise<void> {
// //     await createUserWithEmailAndPassword(this.afAuth, email, password);
// //   }

// //   /** Cierra la sesión en Firebase */
// //   async logout(): Promise<void> {
// //     await signOut(this.afAuth);
// //   }
// // }


