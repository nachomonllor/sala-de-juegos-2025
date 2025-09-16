import { Injectable } from '@angular/core';
import {
  createClient,
  type SupabaseClient,
  type AuthChangeEvent,
  type Session,
  type User as SupaUser
} from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseKey, environment.supabaseUrl, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true // útil si en el futuro usás OAuth
      }
    });
  }

  /** Acceso directo al cliente por si necesitás queries a tablas */
  get sdk(): SupabaseClient {
    return this.client;
  }

  /** Sesión actual (o null) */
  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  /** Suscripción a cambios de autenticación. Devuelve un unsubscribe. */
  onAuthChange(
    cb: (event: AuthChangeEvent, session: Session | null) => void
  ): () => void {
    const { data } = this.client.auth.onAuthStateChange((event, session) => cb(event, session));
    return () => data.subscription.unsubscribe();
  }

  /** Login con email/password */
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data; // { user, session }
  }

  /** Registro con email/password */
  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
    return data; // { user, session }
  }

  /** Logout */
  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  /** Usuario actual (requiere sesión válida) */
  async getUser(): Promise<SupaUser | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error) {
      // Si no hay sesión, getUser devuelve error "Auth session missing!"
      if (error.message?.toLowerCase().includes('session')) return null;
      throw error;
    }
    return data.user;
  }
}








// import { Injectable } from '@angular/core';
// import {
//   createClient,
//   type SupabaseClient,
//   type AuthChangeEvent,
//   type Session,
//   type User as SupaUser
// } from '@supabase/supabase-js';
// import { environment } from '../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class SupabaseService {
//   private readonly client: SupabaseClient;

//   constructor() {
//     this.client = createClient(environment.supabaseUrl, environment.supabaseKey, {
//       auth: {
//         persistSession: true,
//         autoRefreshToken: true,
//         detectSessionInUrl: true // útil si en el futuro usás OAuth
//       }
//     });
//   }

//   /** Acceso directo al cliente por si necesitás queries a tablas */
//   get sdk(): SupabaseClient {
//     return this.client;
//   }

//   /** Sesión actual (o null) */
//   async getSession(): Promise<Session | null> {
//     const { data, error } = await this.client.auth.getSession();
//     if (error) throw error;
//     return data.session;
//   }

//   /** Suscripción a cambios de autenticación. Devuelve un unsubscribe. */
//   onAuthChange(
//     cb: (event: AuthChangeEvent, session: Session | null) => void
//   ): () => void {
//     const { data } = this.client.auth.onAuthStateChange((event, session) => cb(event, session));
//     return () => data.subscription.unsubscribe();
//   }

//   /** Login con email/password */
//   async signInWithPassword(email: string, password: string) {
//     const { data, error } = await this.client.auth.signInWithPassword({ email, password });
//     if (error) throw error;
//     return data; // { user, session }
//   }

//   /** Registro con email/password */
//   async signUp(email: string, password: string) {
//     const { data, error } = await this.client.auth.signUp({ email, password });
//     if (error) throw error;
//     return data; // { user, session }
//   }

//   /** Logout */
//   async signOut(): Promise<void> {
//     const { error } = await this.client.auth.signOut();
//     if (error) throw error;
//   }

//   /** Usuario actual (requiere sesión válida) */
//   async getUser(): Promise<SupaUser | null> {
//     const { data, error } = await this.client.auth.getUser();
//     if (error) {
//       // Si no hay sesión, getUser devuelve error "Auth session missing!"
//       if (error.message?.toLowerCase().includes('session')) return null;
//       throw error;
//     }
//     return data.user;
//   }
// }




// // src/app/core/supabase.service.ts
// import { Injectable, signal, computed } from '@angular/core';
// import { createClient, SupabaseClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js';
// import { environment } from '../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class SupabaseService {
//   private supabase: SupabaseClient;
//   private _session = signal<Session | null>(null);
//   user = computed<User | null>(() => this._session()?.user ?? null);

//   constructor() {
//     this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
//     this.initSession();
//   }

//   private async initSession() {
//     const { data } = await this.supabase.auth.getSession();
//     this._session.set(data.session ?? null);

//     // Mantener sesión sincronizada
//     this.supabase.auth.onAuthStateChange((_evt, sess) => this._session.set(sess));
//   }

//   get session() { return this._session(); }
//   get isLoggedIn() { return !!this._session(); }

//   // 👇 Método que faltaba
//   onAuthChange(cb: (event: AuthChangeEvent, session: Session | null) => void) {
//     return this.supabase.auth.onAuthStateChange(cb);
//   }

//   async getSession(): Promise<Session | null> {
//     const { data } = await this.supabase.auth.getSession();
//     return data.session ?? null;
//   }

//   async signIn(email: string, password: string) {
//     const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
//     if (error) throw error;
//     return { user: data.user };
//   }

//   async signOut() {
//     await this.supabase.auth.signOut();
//   }

//   async logLogin(uid: string, email: string) {
//     const { error } = await this.supabase
//       .from('login_logs')
//       .insert({ uid, email, fecha: new Date().toISOString() });

//     if (error) console.error('Error guardando log de login:', error);
//   }

//   // === Métodos esperados por UsersService ===
//   async getProfile(uid: string) {
//     const { data, error } = await this.supabase
//       .from('profiles')
//       .select('id, display_name, avatar_url, updated_at, created_at')
//       .eq('id', uid)
//       .maybeSingle();

//     if (error) throw error;
//     return data;
//   }

//   async upsertProfile(uid: string, displayName: string) {
//     const payload = { id: uid, display_name: displayName, updated_at: new Date().toISOString() };

//     const { data, error } = await this.supabase
//       .from('profiles')
//       .upsert(payload, { onConflict: 'id' })
//       .select()
//       .maybeSingle();

//     if (error) throw error;
//     return data;
//   }

//   // En src/app/core/supabase.service.ts
//   async listProfiles() {
//     const { data, error } = await this.supabase
//       .from('profiles')
//       .select('id, email, first_name, last_name, display_name, game_plays, avatar_url, created_at, updated_at');

//     if (error) throw error;
//     return data;
//   }

// }






// -------------------------- ------------------------------------------------------------------------------
// -------------------------- ------------------------------------------------------------------------------

// import { Injectable, signal } from '@angular/core';
// import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
// import { environment } from '../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class SupabaseService {
//   private supabase: SupabaseClient;
//   private _session = signal<Session | null>(null);

//   constructor() {
//     this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
//     this.initSession();
//   }

//   private async initSession() {
//     const { data } = await this.supabase.auth.getSession();
//     this._session.set(data.session ?? null);
//     this.supabase.auth.onAuthStateChange((_evt, sess) => this._session.set(sess));
//   }

//   get session() { return this._session(); }
//   get isLoggedIn() { return !!this._session(); }

//   async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
//     const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
//     return { user: data?.user ?? null, error };
//   }

//   async signOut() { await this.supabase.auth.signOut(); }

//   async logLogin(uid: string, email: string) {
//     // Tabla "login_logs" en schema "public"
//     const { error } = await this.supabase
//       .from('login_logs')
//       .insert({ uid, email, fecha: new Date().toISOString() });
//     if (error) console.error('Error guardando log de login:', error);
//   }

//   async getSession(): Promise<Session | null> {
//     const { data } = await this.supabase.auth.getSession();
//     return data.session ?? null;
//   }
// }

// --------------------------
// --------------------------


// import { Injectable } from '@angular/core';
// import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
// import { environment } from '../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class SupabaseService {
//   private client: SupabaseClient;

//   constructor() {
//     this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
//   }

//   // --- Auth ---
//   signIn(email: string, password: string) {
//     return this.client.auth.signInWithPassword({ email, password });
//   }
//   signUp(email: string, password: string, displayName?: string) {
//     return this.client.auth.signUp({ email, password })
//       .then(async ({ data, error }) => {
//         if (error) throw error;
//         if (data.user) {
//           await this.client.from('profiles').upsert({ id: data.user.id, display_name: displayName ?? email });
//           await this.client.from('login_logs').insert({ user_id: data.user.id, email });
//         }
//         return { data };
//       });
//   }
//   signOut() { return this.client.auth.signOut(); }
//   getSession() { return this.client.auth.getSession(); }
//   onAuthChange(cb: (e: AuthChangeEvent, s: Session | null) => void) {
//     return this.client.auth.onAuthStateChange(cb);
//   }

//   // src/app/core/supabase.service.ts  (añadí estas helpers si no estaban)
//   async getProfile(userId: string) {
//     return this.client.from('profiles').select('*').eq('id', userId).single();
//   }
//   async upsertProfile(userId: string, displayName: string) {
//     return this.client.from('profiles').upsert({ id: userId, display_name: displayName });
//   }
//   async listProfiles() {
//     return this.client.from('profiles').select('*').order('created_at', { ascending: false });
//   }

//   // (podés sumar acá chat/resultados/encuesta cuando lleguemos a esa parte)
//}





// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class SupabaseService {

//   constructor() { }
// }
