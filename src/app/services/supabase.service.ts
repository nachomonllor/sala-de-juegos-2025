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
  id: number;
  room: string;
  usuario_id?: number | null;  // bigint en BD, opcional para mensajes optimistas
  display_name: string | null;
  mensaje?: string;            // nombre de columna en BD, opcional para mensajes optimistas
  enviado_en?: string;         // nombre de columna en BD, opcional para mensajes optimistas

  // Campos de compatibilidad para el código existente (usados por el componente)
  user_id?: string | null;
  message?: string;
  created_at?: string;
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
        environment.supabaseKey,
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
      .schema('esquema_juegos')
      .from('mensajes_chat')
      .select('*')
      .eq('room', room)
      .order('enviado_en', { ascending: true })
      .limit(limit);

    if (error) throw error;
    // Mapear campos de BD a la interfaz
    return (data || []).map((row: any) => ({
      ...row,
      message: row.mensaje,
      created_at: row.enviado_en,
      user_id: row.usuario_id?.toString() || null
    })) as ChatMessage[];
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

    // Obtener el usuario_id (el usuario ya debe existir, creado en registro/login)
    const usuarioId = await this.getUsuarioIdFromSupabaseUid(user.id);
    if (!usuarioId) {
      throw new Error('Usuario no encontrado. Debes registrarte primero.');
    }

    const { data, error } = await this.client
      .schema('esquema_juegos')
      .from('mensajes_chat')
      .insert({ 
        usuario_id: usuarioId,  // ID del usuario en esquema_juegos.usuarios
        room, 
        mensaje: message,
        display_name 
      })
      .select('*')
      .single();

    if (error) throw error;
    // Mapear campos de BD a la interfaz
    const mapped = {
      ...data,
      message: data.mensaje,
      created_at: data.enviado_en,
      user_id: data.usuario_id?.toString() || null
    };
    return mapped as ChatMessage;
  }

  /* ========================= USUARIOS ESQUEMA_JUEGOS ========================= */

  /**
   * Crea un usuario en esquema_juegos.usuarios
   * Usado en registro/login
   */
  async createUsuarioInEsquemaJuegos(
    nombre: string,
    apellido: string | null,
    email: string,
    fechaNacimiento: string | null,
    supabaseUid: string
  ): Promise<number> {
    const { data, error } = await this.client
      .schema('esquema_juegos')
      .from('usuarios')
      .insert({
        supabase_uid: supabaseUid,
        email,
        nombre,
        apellido: apellido || null,
        fecha_nacimiento: fechaNacimiento || null
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Obtiene el usuario_id (bigint) de esquema_juegos.usuarios a partir del UUID de Supabase Auth
   * Solo busca, NO crea usuarios (asume que el usuario ya existe)
   * Usado en chat, logins, resultados, etc.
   */
  async getUsuarioIdFromSupabaseUid(supabaseUid: string): Promise<number | null> {
    const { data, error } = await this.client
      .schema('esquema_juegos')
      .from('usuarios')
      .select('id')
      .eq('supabase_uid', supabaseUid)
      .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
  }


  /** Realtime de INSERT en la sala */
  subscribeToChat(room: string, onNew: (m: ChatMessage) => void): () => void {
    const channel = this.client
      .channel(`room:${room}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'esquema_juegos', 
          table: 'mensajes_chat', 
          filter: `room=eq.${room}` 
        },
        (payload) => {
          // Mapear campos de BD a la interfaz
          const newMsg = payload.new as any; // TypeScript puede ser estricto con payload.new
          const mapped = {
            ...newMsg,
            message: newMsg.mensaje,
            created_at: newMsg.enviado_en,
            user_id: newMsg.usuario_id?.toString() || null
          };
          onNew(mapped as ChatMessage);
        }
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

  /* ========================= USUARIOS (esquema_juegos) ========================= */
  /* Métodos de profiles eliminados - ahora se usa esquema_juegos.usuarios */

  /* ========================= LOGS & RESULTS ========================= */

  async logLogin(supabaseUid: string): Promise<void> {
    const usuarioId = await this.getUsuarioIdFromSupabaseUid(supabaseUid);
    if (!usuarioId) {
      throw new Error('Usuario no encontrado en esquema_juegos.usuarios');
    }

    const { error } = await this.client
      .schema('esquema_juegos')
      .from('log_logins')
      .insert({ usuario_id: usuarioId });
    if (error) throw error;
  }

  async getLoginLogs(limit = 100): Promise<LoginLog[]> {
    const { data, error } = await this.client
      .schema('esquema_juegos')
      .from('log_logins')
      .select('*')
      .order('fecha_ingreso', { ascending: false })
      .limit(limit);
    if (error) throw error;
    // Mapear campos de BD a la interfaz
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.usuario_id?.toString() || null,
      email: null, // no está en el esquema, se puede obtener del usuario si es necesario
      created_at: row.fecha_ingreso
    })) as LoginLog[];
  }

  async saveResult(game: string, score: number, meta: any = null): Promise<void> {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) throw new Error('No hay usuario logueado');

    const usuarioId = await this.getUsuarioIdFromSupabaseUid(user.id);
    if (!usuarioId) {
      throw new Error('Usuario no encontrado en esquema_juegos.usuarios');
    }

    // Buscar el juego_id por código
    const { data: juego, error: juegoError } = await this.client
      .schema('esquema_juegos')
      .from('juegos')
      .select('id')
      .eq('codigo', game)
      .maybeSingle();

    if (juegoError) throw juegoError;
    if (!juego) {
      throw new Error(`Juego con código '${game}' no encontrado`);
    }

    const { error } = await this.client
      .schema('esquema_juegos')
      .from('partidas')
      .insert({
        usuario_id: usuarioId,
        juego_id: juego.id,
        puntaje: score,
        datos_extra: meta,
        gano: null // se puede calcular si es necesario
      });
    if (error) throw error;
  }

  async listResultsByUser(supabaseUid?: string): Promise<ResultRow[]> {
    let usuarioId: number | null = null;
    
    if (supabaseUid) {
      usuarioId = await this.getUsuarioIdFromSupabaseUid(supabaseUid);
    } else {
      const { data: { user } } = await this.client.auth.getUser();
      if (user) {
        usuarioId = await this.getUsuarioIdFromSupabaseUid(user.id);
      }
    }

    if (!usuarioId) {
      return [];
    }

    const { data, error } = await this.client
      .schema('esquema_juegos')
      .from('partidas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('fecha_partida', { ascending: false });
    if (error) throw error;
    
    // Mapear campos de BD a la interfaz
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.usuario_id?.toString() || null,
      game: row.juego_id?.toString() || null, // TODO: obtener código del juego si es necesario
      score: row.puntaje || 0,
      meta: row.datos_extra,
      created_at: row.fecha_partida
    })) as ResultRow[];
  }

  async listAllResults(limit = 100) {
    const { data, error } = await this.client
      .schema('esquema_juegos')
      .from('partidas')
      .select('*')
      .order('fecha_partida', { ascending: false })
      .limit(limit);
    if (error) throw error;
    
    // Mapear campos de BD a la interfaz
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.usuario_id?.toString() || null,
      game: row.juego_id?.toString() || null,
      score: row.puntaje || 0,
      meta: row.datos_extra,
      created_at: row.fecha_partida
    })) as ResultRow[];
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

//   Métodos de profiles eliminados - ahora se usa esquema_juegos.usuarios

// }

