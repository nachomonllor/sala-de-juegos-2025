
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

  // --- Aliases para compatibilidad con el componente ---
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

  // exponer el cliente para poder usar .from(...) ---
  get client() {
    return this.supa.client; // asegúrate de exponer 'client' en SupabaseService (abajo)
  }
}





// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import type {
//   Session,
//   User as SupaUser,
//   AuthChangeEvent,
// } from '@supabase/supabase-js';
// import { SupabaseService } from './supabase.service';

// export type Usuario = SupaUser;

// type ResultadoAuth<T = any> = { data: T; error: any };

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private readonly _usuario$ = new BehaviorSubject<Usuario | null>(null);
//   public readonly usuario$ = this._usuario$.asObservable();

//   private desuscribirAuthChange?: () => void;

//   constructor(private readonly supa: SupabaseService) {
//     this.inicializar();
//   }

//   private async inicializar(): Promise<void> {
//     const sesion = await this.supa.getSession();      // <- devuelve Session | null
//     this._usuario$.next(sesion?.user ?? null);

//     // Suscribirse a cambios de auth
//     this.desuscribirAuthChange = this.supa.onAuthChange(
//       (_evento: AuthChangeEvent, nuevaSesion: Session | null) => {
//         this._usuario$.next(nuevaSesion?.user ?? null);
//       }
//     );
//   }

//   // ======== API en castellano ========

//   /** Inicia sesión con email/contraseña */
//   async iniciarSesion(correo: string, contrasenia: string): Promise<ResultadoAuth> {
//     const { data, error } = await this.supa.signInWithPassword(correo, contrasenia);
//     // data = { user, session } en supabase-js v2
//     if (!error) this._usuario$.next(data.user ?? null);
//     return { data, error };
//   }

//   /** Registra usuario con email/contraseña */
//   async registrarse(correo: string, contrasenia: string): Promise<ResultadoAuth> {
//     const { data, error } = await this.supa.signUp(correo, contrasenia);
//     return { data, error };
//   }

//   /** Cierra sesión del usuario actual */
//   async cerrarSesion(): Promise<void> {
//     await this.supa.signOut();
//     this._usuario$.next(null);
//   }

//   // ======== Aliases en inglés (compatibilidad) ========

//   async signIn(email: string, password: string): Promise<ResultadoAuth> {
//     return this.iniciarSesion(email, password);
//   }

//   async signUp(email: string, password: string): Promise<ResultadoAuth> {
//     return this.registrarse(email, password);
//   }

//   async logout(): Promise<void> {
//     return this.cerrarSesion();
//   }

//   /** Usuario actual (snapshot) */
//   get usuarioActual(): Usuario | null {
//     return this._usuario$.value;
//   }
// }


