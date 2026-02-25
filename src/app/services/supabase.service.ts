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

    this.hacerPing(); // Enviar un ping inicial al crear el servicio
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

  // async getLoginLogs(limit = 100): Promise<LoginLog[]> {
  //   const { data, error } = await this.client
  //     .schema('esquema_juegos')
  //     .from('log_logins')
  //     .select('*')
  //     .order('fecha_ingreso', { ascending: false })
  //     .limit(limit);
  //   if (error) throw error;
  //   // Mapear campos de BD a la interfaz
  //   return (data || []).map((row: any) => ({
  //     id: row.id,
  //     user_id: row.usuario_id?.toString() || null,
  //     email: null, // no está en el esquema, se puede obtener del usuario si es necesario
  //     created_at: row.fecha_ingreso
  //   })) as LoginLog[];
  // }

  async getLoginLogs(limit = 100): Promise<LoginLog[]> {
    const { data, error } = await this.client
      .schema('esquema_juegos')
      .from('log_logins')
      // ACÁ ESTÁ LA MAGIA: Traemos todo de log_logins Y el email de usuarios
      .select('*, usuarios(email)') 
      .order('fecha_ingreso', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Mapear campos de BD a la interfaz
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.usuario_id?.toString() || null,
      // ACÁ MAPEAMOS EL EMAIL QUE TRAJIMOS EN EL SELECT
      email: row.usuarios?.email || 'Desconocido', 
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

  // async listResultsByUser(supabaseUid?: string): Promise<ResultRow[]> {
  //   let usuarioId: number | null = null;
    
  //   if (supabaseUid) {
  //     usuarioId = await this.getUsuarioIdFromSupabaseUid(supabaseUid);
  //   } else {
  //     const { data: { user } } = await this.client.auth.getUser();
  //     if (user) {
  //       usuarioId = await this.getUsuarioIdFromSupabaseUid(user.id);
  //     }
  //   }

  //   if (!usuarioId) {
  //     return [];
  //   }

  //   const { data, error } = await this.client
  //     .schema('esquema_juegos')
  //     .from('partidas')
  //     .select('*')
  //     .eq('usuario_id', usuarioId)
  //     .order('fecha_partida', { ascending: false });
  //   if (error) throw error;
    
  //   // Mapear campos de BD a la interfaz
  //   return (data || []).map((row: any) => ({
  //     id: row.id,
  //     user_id: row.usuario_id?.toString() || null,
  //     game: row.juego_id?.toString() || null, // TODO: obtener código del juego si es necesario
  //     score: row.puntaje || 0,
  //     meta: row.datos_extra,
  //     created_at: row.fecha_partida
  //   })) as ResultRow[];
  // }


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
      // ACÁ LA MAGIA: Traemos los datos de la partida y cruzamos con la tabla juegos
      .select('*, juegos(codigo, nombre)') 
      .eq('usuario_id', usuarioId)
      .order('fecha_partida', { ascending: false });
      
    if (error) throw error;
    
    // Mapear campos de BD a la interfaz
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.usuario_id?.toString() || null,
      // MAPEAMOS EL NOMBRE DEL JUEGO (Prioriza el nombre legible, si no usa el código)
      game: row.juegos?.nombre || row.juegos?.codigo || 'Desconocido', 
      score: row.puntaje || 0,
      meta: row.datos_extra,
      created_at: row.fecha_partida
    })) as ResultRow[];
  }

  // async listAllResults(limit = 100) {
  //   const { data, error } = await this.client
  //     .schema('esquema_juegos')
  //     .from('partidas')
  //     .select('*')
  //     .order('fecha_partida', { ascending: false })
  //     .limit(limit);
  //   if (error) throw error;
    
  //   // Mapear campos de BD a la interfaz
  //   return (data || []).map((row: any) => ({
  //     id: row.id,
  //     user_id: row.usuario_id?.toString() || null,
  //     game: row.juego_id?.toString() || null,
  //     score: row.puntaje || 0,
  //     meta: row.datos_extra,
  //     created_at: row.fecha_partida
  //   })) as ResultRow[];
  // }

  async listAllResults(limit = 100) {
    const { data, error } = await this.client
      .schema('esquema_juegos')
      .from('partidas')
      // JOIN MÚLTIPLE: Traemos la info de la partida, el nombre del juego y el email del jugador
      .select('*, juegos(codigo, nombre), usuarios(email)') 
      .order('fecha_partida', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Mapear campos de BD a la interfaz
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.usuario_id?.toString() || null,
      // MAPEAMOS NOMBRE DEL JUEGO Y EMAIL DEL JUGADOR
      game: row.juegos?.nombre || row.juegos?.codigo || 'Desconocido',
      email: row.usuarios?.email || 'Anónimo', // Podés agregar este campo opcional a tu ResultRow si te sirve
      score: row.puntaje || 0,
      meta: row.datos_extra,
      created_at: row.fecha_partida
    })) as ResultRow[];
  }

  /* Acceso directo al cliente si necesitás queries ad-hoc */
  get sdk(): SupabaseClient {
    return this.client;
  }


  // =========================================================
  // KEEP ALIVE (Anti-Pausa de Supabase)
  // =========================================================

  /**
   * Inicia el ciclo de pings para mantener la base de datos despierta.
   * Llamar a este método en el constructor del servicio.
   */
  public iniciarKeepAlive(): void {
    // Ping inicial al cargar la app
    this.hacerPing();

    // Ping cada 2 horas (7200000 ms)
    setInterval(() => {
      this.hacerPing();
    }, 7200000); 
  }

  private async hacerPing(): Promise<void> {
    try {
      // Importante: Asegurate de que tu cliente esté configurado para usar 'esquema_juegos'
      // O forzalo en la consulta encadenando .schema('esquema_juegos')
      const { error } = await this.client
        .schema('esquema_juegos') 
        .from('ping_keep_alive')
        .upsert({ 
          id: 1, 
          ultimo_ping: new Date().toISOString(), 
          origen: 'Angular Sala de Juegos' 
        });

      if (error) throw error;
      console.log('⚡ [Supabase] Ping Keep-Alive enviado con éxito (Sala de Juegos).');
    } catch (err) {
      console.warn('⚠️ [Supabase] Error en Ping Keep-Alive:', err);
    }
  }


}


