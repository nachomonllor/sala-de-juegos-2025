// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { Session, User as SupaUser, AuthChangeEvent } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export type User = SupaUser;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user$ = new BehaviorSubject<SupaUser | null>(null);

  constructor(private readonly supa: SupabaseService) {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const session = await this.supa.getSession();
      this._user$.next(session?.user ?? null);

      // Mantener sincronizado el usuario ante cambios de sesión
      this.supa.onAuthChange(
        (_event: AuthChangeEvent, newSession: Session | null) => {
          this._user$.next(newSession?.user ?? null);
        }
      );
    } catch (e) {
      console.error('AuthService init error:', e);
      this._user$.next(null);
    }
  }

  // ==== Observables / getters ====
  get user$(): Observable<SupaUser | null> { return this._user$.asObservable(); }
  get user(): SupaUser | null { return this._user$.value; }
  get session(): Session | null { return this.supa.session; }
  isLoggedIn(): boolean { return this.supa.isLoggedIn; }

  // ==== Acciones de autenticación ====
  async signIn(email: string, password: string): Promise<{ user: SupaUser }> {
    const { user } = await this.supa.signIn(email, password);
    this._user$.next(user ?? null); // sincroniza inmediatamente
    return { user };
  }

  async signOut(): Promise<void> {
    await this.supa.signOut();
    this._user$.next(null);
  }

  // ==== Helpers de conveniencia ====
  get uid(): string | null { return this.user?.id ?? null; }
  get email(): string | null { return this.user?.email ?? null; }

  // async signOut(): Promise<void> {
  //   await this.supa.signOut();
  //   this._user$.next(null);
  // }

  // 👇 Agregá este alias para compatibilidad
  logout(): Promise<void> {
    return this.signOut();
  }
  
}










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


