import { Injectable } from '@angular/core';
import {
  createClient,
  type SupabaseClient,
  type AuthChangeEvent,
  type Session,
  type User as SupaUser,
} from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/* ===== Tipos ===== */

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  role?: 'user' | 'admin' | null;
  avatar_url?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ChatMessage {
  id: number;                 // <- tu app lo usa como number
  room: string;
  user_id: string | null;
  display_name: string | null;
  message: string;
  created_at: string;

  // opcionales por compatibilidad (si en algún punto se usaron)
  uid?: string | null;
  email?: string | null;
  text?: string;
  timestamp?: string;
}

export interface LoginLog {
  id: number;
  user_id: string | null;
  email: string | null;
  created_at: string;
}

export interface ResultRow {
  id: number;
  user_id: string | null;
  game: string;
  score: number;
  meta: any | null;
  created_at: string;
}

/* Evitar múltiples instancias en dev con HMR */
declare global {
  interface Window { __supabaseClient__?: SupabaseClient }
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public readonly client: SupabaseClient;

  constructor() {
    if (!window.__supabaseClient__) {
      window.__supabaseClient__ = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // clave única para este proyecto/app (evita colisiones en localhost)
            storageKey: 'sb-taswckilspgrlcrdouxb-auth-token-sdj2025',
          },
        }
      );
    }
    this.client = window.__supabaseClient__!;
  }

  /* ========================= CHAT ========================= */

  async listChatMessages(room: string, limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await this.client
      .from('chat_messages')
      .select('*')
      .eq('room', room)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as ChatMessage[];
  }

  /** Inserta y devuelve la fila (para reemplazar el mensaje optimista en UI) */
  // async addChatMessage(room: string, message: string): Promise<ChatMessage> {
  //   const { data: { session } } = await this.client.auth.getSession();
  //   const user = session?.user;
  //   if (!user) throw new Error('Debes iniciar sesión para chatear.');

  //   // Nombre visible robusto: parte local del email
  //   const display_name = user.email?.split('@')[0] ?? 'Anónimo';

  //   const { data, error } = await this.client
  //     .from('chat_messages')
  //     .insert({ room, message, user_id: user.id, display_name })
  //     .select('*')
  //     .single();

  //   if (error) throw error;
  //   return data as ChatMessage;
  // }

  // async addChatMessage(room: string, message: string): Promise<ChatMessage> {
  //   const { data: { session } } = await this.client.auth.getSession();
  //   const user = session?.user;
  //   if (!user) throw new Error('Debes iniciar sesión para chatear.');

  //   const display_name = user.email?.split('@')[0] ?? 'Anónimo';

  //   const { data, error } = await this.client
  //     .from('chat_messages')
  //     .insert({ room, message, display_name }) // <- sin user_id
  //     .select('*')
  //     .single();

  //   if (error) throw error;
  //   return data as ChatMessage;
  // }

  async addChatMessage(room: string, message: string): Promise<ChatMessage> {
    const { data: { session } } = await this.client.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Debes iniciar sesión para chatear.');

    const display_name = user.email?.split('@')[0] ?? 'Anónimo';

    const { data, error } = await this.client
      .from('chat_messages')
      .insert({ room, message, display_name }) // <- SIN user_id
      .select('*')
      .single();

    if (error) throw error;
    return data as ChatMessage;
  }


  /** Realtime de INSERT en la sala */
  subscribeToChat(room: string, onNew: (m: ChatMessage) => void): () => void {
    const channel = this.client
      .channel(`room:${room}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room=eq.${room}` },
        (payload) => onNew(payload.new as ChatMessage)
      )
      .subscribe();
    return () => this.client.removeChannel(channel);
  }

  /** Canal broadcast para indicador "está escribiendo…" */
  connectTyping(
    room: string,
    onRemoteTyping: (payload: { user_id: string; name: string; t: number }) => void
  ) {
    const channel = this.client
      .channel(`typing:${room}`)
      .on('broadcast', { event: 'typing' }, (p: any) => onRemoteTyping(p.payload))
      .subscribe();

    return {
      notifyTyping: (name: string, user_id: string) => {
        channel.send({ type: 'broadcast', event: 'typing', payload: { user_id, name, t: Date.now() } });
      },
      unsubscribe: () => this.client.removeChannel(channel),
    };
  }

  /* ========================= AUTH ========================= */

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  onAuthChange(
    cb: (event: AuthChangeEvent, session: Session | null) => void
  ): () => void {
    const { data } = this.client.auth.onAuthStateChange((event, session) => cb(event, session));
    return () => data.subscription.unsubscribe();
  }

  async getUser(): Promise<SupaUser | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error) {
      // si no hay sesión, suele decir "Auth session missing!"
      if (error.message?.toLowerCase().includes('session')) return null;
      throw error;
    }
    return data.user;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data; // { user, session }
  }

  async signInWithPassword(email: string, password: string) {
    return this.signIn(email, password);
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  /* ========================= PROFILES ========================= */

  selectProfiles() {
    // Devuelve una Promise<{ data, error }>
    return this.client
      .from('profiles')
      .select('id, first_name, last_name, email, game_plays')
      .order('last_name', { ascending: true });
  }

  async upsertProfile(uid: string, displayName: string, avatar_url: string | null = null): Promise<void> {
    const me = await this.getUser();
    const email = me?.email ?? null;
    const { error } = await this.client.from('profiles').upsert(
      {
        id: uid,
        email,
        display_name: displayName,
        avatar_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) throw error;
  }

  async getProfile(uid: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id,email,display_name,avatar_url,role,created_at,updated_at')
      .eq('id', uid)
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  }

  async listProfiles(): Promise<Profile[]> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id,email,display_name,avatar_url,role,created_at,updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  }

  async upsertProfileNames(uid: string, firstName: string, lastName: string, email?: string | null): Promise<void> {
    const display = [firstName, lastName].filter(Boolean).join(' ').trim() || null;
    const { error } = await this.client.from('profiles').upsert(
      {
        id: uid,
        email: email ?? null,
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: display,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) throw error;
  }

  /* ========================= LOGS & RESULTS ========================= */

  async logLogin(user_id: string, email: string | null): Promise<void> {
    const { error } = await this.client.from('login_logs').insert({ user_id, email });
    if (error) throw error;
  }

  async getLoginLogs(limit = 100): Promise<LoginLog[]> {
    const { data, error } = await this.client
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as LoginLog[];
  }

  async saveResult(game: string, score: number, meta: any = null): Promise<void> {
    const me = await this.getUser();
    const { error } = await this.client.from('results').insert({
      user_id: me?.id ?? null,
      game,
      score,
      meta,
    });
    if (error) throw error;
  }

  async listResultsByUser(uid?: string): Promise<ResultRow[]> {
    const me = uid ? { id: uid } : await this.getUser();
    const { data, error } = await this.client
      .from('results')
      .select('*')
      .eq('user_id', me?.id ?? '')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as ResultRow[];
  }

  async listAllResults(limit = 100) {
    const { data, error } = await this.client
      .from('results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as ResultRow[];
  }

  /* Acceso directo al cliente si necesitás queries ad-hoc */
  get sdk(): SupabaseClient {
    return this.client;
  }
}




// import { Injectable } from '@angular/core';
// import {
//   createClient,
//   type SupabaseClient,
//   type AuthChangeEvent,
//   type Session,
//   type User as SupaUser,
// } from '@supabase/supabase-js';
// import { environment } from '../../environments/environment';

// // DEBE EXISTIR esta interfaz arriba del archivo:
// export interface Profile {
//   id: string;
//   email: string | null;
//   display_name: string | null;
//   role?: 'user' | 'admin' | null;
//   avatar_url?: string | null;
//   created_at: string | null;
//   updated_at: string | null;
// }

// export interface ChatMessage {
//   id: number;
//   room: string;
//   user_id: string | null;
//   display_name: string | null;
//   message: string;
//   created_at: string;

//   // OPCIONALES POR SI EN ALGUN LUGAR SE USARON ESTOS NOMBRES
//   uid?: string | null;
//   email?: string | null;
//   text?: string;
//   timestamp?: string;
// }

// export interface LoginLog {
//   id: number;
//   user_id: string | null;
//   email: string | null;
//   created_at: string;
// }

// export interface ResultRow {
//   id: number;
//   user_id: string | null;
//   game: string;
//   score: number;
//   meta: any | null;
//   created_at: string;
// }

// declare global {
//   interface Window { __supabaseClient__?: SupabaseClient }
// }

// @Injectable({ providedIn: 'root' })
// export class SupabaseService {

//   public readonly client: SupabaseClient;

//   constructor() {
//     if (!window.__supabaseClient__) {
//       window.__supabaseClient__ = createClient(
//         environment.supabaseUrl,
//         environment.supabaseAnonKey,
//         {
//           auth: {
//             persistSession: true,
//             autoRefreshToken: true,
//             detectSessionInUrl: true,
//             // clave única para este proyecto/app (evita colisiones con otros proyectos en localhost)
//             storageKey: 'sb-taswckilspgrlcrdouxb-auth-token-sdj2025',
//           },
//         }
//       );
//     }
//     this.client = window.__supabaseClient__;
//   }

//   //   ----------------  CHAT --------------------
//   async listChatMessages(room: string, limit = 50): Promise<ChatMessage[]> {
//     const { data, error } = await this.client
//       .from('chat_messages')
//       .select('*')
//       .eq('room', room)
//       .order('created_at', { ascending: true })
//       .limit(limit);

//     if (error) throw error;
//     return data as ChatMessage[];
//   }

//   // Devuelve la fila insertada (para reemplazar el "optimista")
//   async addChatMessage(room: string, message: string): Promise<ChatMessage> {
//     const { data: { session } } = await this.client.auth.getSession();
//     const user = session?.user;
//     if (!user) throw new Error('Debes iniciar sesión para chatear.');

//     // const display_name = (user.user_metadata?.full_name as string) || (user.email?.split('@')[0] ?? 'Anónimo');

//     const display_name = user.email?.split('@')[0] ?? 'Anónimo';

//     const { data, error } = await this.client
//       .from('chat_messages')
//       .insert({ room, message, user_id: user.id, display_name })
//       .select('*')
//       .single();

//     if (error) throw error;
//     return data as ChatMessage;
//   }

//   subscribeToChat(room: string, onNew: (m: ChatMessage) => void): () => void {
//     const channel = this.client
//       .channel(`room:${room}`)
//       .on(
//         'postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room=eq.${room}` },
//         (payload) => onNew(payload.new as ChatMessage)
//       )
//       .subscribe();
//     return () => this.client.removeChannel(channel);
//   }

//   /** Canal de broadcast para "está escribiendo…" */
//   connectTyping(
//     room: string,
//     onRemoteTyping: (payload: { user_id: string; name: string; t: number }) => void
//   ) {
//     const channel = this.client
//       .channel(`typing:${room}`)
//       .on('broadcast', { event: 'typing' }, (p: any) => onRemoteTyping(p.payload))
//       .subscribe();

//     return {
//       notifyTyping: (name: string, user_id: string) => {
//         channel.send({ type: 'broadcast', event: 'typing', payload: { user_id, name, t: Date.now() } });
//       },
//       unsubscribe: () => this.client.removeChannel(channel)
//     };
//   }

//   // -------------------





//   /** ===== AUTH ===== */
//   async getSession(): Promise<Session | null> {
//     const { data, error } = await this.client.auth.getSession();
//     if (error) throw error;
//     return data.session;
//   }

//   onAuthChange(
//     cb: (event: AuthChangeEvent, session: Session | null) => void
//   ): () => void {
//     const { data } = this.client.auth.onAuthStateChange((event, session) => cb(event, session));
//     return () => data.subscription.unsubscribe();
//   }

//   async getUser(): Promise<SupaUser | null> {
//     const { data, error } = await this.client.auth.getUser();
//     if (error) {
//       if (error.message?.toLowerCase().includes('session')) return null;
//       throw error;
//     }
//     return data.user;
//   }

//   // Alias que tu LoginComponent ya usa:
//   async signIn(email: string, password: string) {
//     const { data, error } = await this.client.auth.signInWithPassword({ email, password });
//     if (error) throw error;
//     return data; // { user, session }
//   }

//   async signInWithPassword(email: string, password: string) {
//     return this.signIn(email, password);
//   }

//   async signUp(email: string, password: string) {
//     const { data, error } = await this.client.auth.signUp({ email, password });
//     if (error) throw error;
//     return data;
//   }

//   async signOut(): Promise<void> {
//     const { error } = await this.client.auth.signOut();
//     if (error) throw error;
//   }

//   //   EXPONER METODOS DE acceso en vez de exponer el cliente
//   selectProfiles() {
//     // Devuelve una Promise<{ data, error }>
//     return this.client
//       .from('profiles')
//       .select('id, first_name, last_name, email, game_plays')
//       .order('last_name', { ascending: true });
//   }

//   async upsertProfile(uid: string, displayName: string, avatar_url: string | null = null): Promise<void> {
//     const me = await this.getUser();
//     const email = me?.email ?? null;
//     const { error } = await this.client.from('profiles').upsert(
//       {
//         id: uid,
//         email,
//         display_name: displayName,
//         avatar_url,
//         updated_at: new Date().toISOString(),
//       },
//       { onConflict: 'id' }
//     );
//     if (error) throw error;
//   }

//   /** ===== LOGIN LOGS ===== */
//   async logLogin(user_id: string, email: string | null): Promise<void> {
//     const { error } = await this.client.from('login_logs').insert({ user_id, email });
//     if (error) throw error;
//   }

//   async getLoginLogs(limit = 100): Promise<LoginLog[]> {
//     const { data, error } = await this.client
//       .from('login_logs')
//       .select('*')
//       .order('created_at', { ascending: false })
//       .limit(limit);
//     if (error) throw error;
//     return data as LoginLog[];
//   }

//   /** ===== CHAT ===== */
//   // async listChatMessages(room = 'global', limit = 50): Promise<ChatMessage[]> {
//   //   const { data, error } = await this.client
//   //     .from('chat_messages')
//   //     .select('*')
//   //     .eq('room', room)
//   //     .order('created_at', { ascending: false })
//   //     .limit(limit);
//   //   if (error) throw error;
//   //   // Volvemos a orden cronológico ascendente para mostrar de antiguo → nuevo
//   //   return (data as ChatMessage[]).slice().reverse();
//   //   // Nota: si querés mantener descendente, no hagas el reverse()
//   // }

//   // async addChatMessage(room: string, message: string, display_name?: string | null): Promise<void> {
//   //   const me = await this.getUser();
//   //   const { error } = await this.client.from('chat_messages').insert({
//   //     room,
//   //     message,
//   //     user_id: me?.id ?? null,
//   //     display_name: display_name ?? me?.email ?? null,
//   //   });
//   //   if (error) throw error;
//   // }

//   // subscribeToChat(room: string, onInsert: (msg: ChatMessage) => void): () => void {
//   //   const channel = this.client
//   //     .channel(`room:${room}`)
//   //     .on(
//   //       'postgres_changes',
//   //       { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room=eq.${room}` },
//   //       (payload) => onInsert(payload.new as ChatMessage)
//   //     )
//   //     .subscribe();
//   //   return () => this.client.removeChannel(channel);
//   // }

//   /** ===== RESULTS (puntajes) ===== */
//   async saveResult(game: string, score: number, meta: any = null): Promise<void> {
//     const me = await this.getUser();
//     const { error } = await this.client.from('results').insert({
//       user_id: me?.id ?? null,
//       game,
//       score,
//       meta,
//     });
//     if (error) throw error;
//   }

//   async listResultsByUser(uid?: string): Promise<ResultRow[]> {
//     const me = uid ? { id: uid } : await this.getUser();
//     const { data, error } = await this.client
//       .from('results')
//       .select('*')
//       .eq('user_id', me?.id ?? '')
//       .order('created_at', { ascending: false });
//     if (error) throw error;
//     return data as ResultRow[];
//   }

//   /** Exponer el cliente por si necesitás queries directos */
//   get sdk(): SupabaseClient {
//     return this.client;
//   }

//   async listAllResults(limit = 100) {
//     const { data, error } = await this.client
//       .from('results')
//       .select('*')
//       .order('created_at', { ascending: false })
//       .limit(limit);
//     if (error) throw error;
//     return data as ResultRow[];
//   }

//   // async getProfile(uid: string): Promise<Profile | null> {
//   //   const { data, error } = await this.client
//   //     .from('profiles')
//   //     .select('id,email,display_name,avatar_url,updated_at,created_at') //
//   //     .eq('id', uid)
//   //     .maybeSingle();
//   //   if (error) throw error;
//   //   return data as Profile | null;
//   // }

//   // async listProfiles(): Promise<Profile[]> {
//   //   const { data, error } = await this.client
//   //     .from('profiles')
//   //     .select('id,email,display_name,avatar_url,updated_at,created_at') //
//   //     .order('updated_at', { ascending: false });
//   //   if (error) throw error;
//   //   return data as Profile[];
//   // }

//   // Dentro de la clase SupabaseService:
//   async getProfile(uid: string): Promise<Profile | null> {
//     const { data, error } = await this.client
//       .from('profiles')
//       .select('id,email,display_name,avatar_url,role,created_at,updated_at')
//       .eq('id', uid)
//       .maybeSingle();
//     if (error) throw error;
//     return data as Profile | null;
//   }

//   async listProfiles(): Promise<Profile[]> {
//     const { data, error } = await this.client
//       .from('profiles')
//       .select('id,email,display_name,avatar_url,role,created_at,updated_at')
//       .order('updated_at', { ascending: false });
//     if (error) throw error;
//     return data as Profile[];
//   }

//   // src/app/services/supabase.service.ts (dentro de la clase)
//   async upsertProfileNames(uid: string, firstName: string, lastName: string, email?: string | null): Promise<void> {
//     const display = [firstName, lastName].filter(Boolean).join(' ').trim() || null;
//     const { error } = await this.client.from('profiles').upsert(
//       {
//         id: uid,
//         email: email ?? null,
//         first_name: firstName || null,
//         last_name: lastName || null,
//         display_name: display,
//         updated_at: new Date().toISOString(),
//       },
//       { onConflict: 'id' }
//     );
//     if (error) throw error;
//   }

// }

