import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { GameCode, Score, ScoreWithUser } from '../models/resultados';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  constructor(private supa: SupabaseService) { } 

  /*
  async recordScore(params: {
    gameCode: GameCode;
    points: number;
    durationSec?: number;
    metaJson?: Record<string, unknown>;
  }): Promise<Score> {
    const { data: { user } } = await this.supa.client.auth.getUser();
    if (!user) throw new Error('No hay usuario logueado');

    await this.ensureProfile(user);

    const insert = {
      user_id: user.id,
      game_code: params.gameCode,
      points: params.points,
      duration_sec: params.durationSec ?? null,
      meta_json: params.metaJson ?? null
    };
    const { data, error } = await this.supa.client
      .from('scores')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      gameCode: data.game_code,
      points: Number(data.points),
      durationSec: data.duration_sec ?? undefined,
      createdAt: data.created_at,
      metaJson: data.meta_json ?? undefined,
    };
  }
  */

  async recordScore(params: {
    gameCode: GameCode;
    points: number;
    durationSec?: number;
    metaJson?: Record<string, unknown>;
  }): Promise<Score> {
    const { data: { user }, error: userErr } = await this.supa.client.auth.getUser();
    if (userErr) throw userErr;
    if (!user) throw new Error('No hay usuario logueado');

    // Obtener usuario_id de esquema_juegos.usuarios
    const usuarioId = await this.supa.getUsuarioIdFromSupabaseUid(user.id);
    if (!usuarioId) {
      throw new Error('Usuario no encontrado en esquema_juegos.usuarios');
    }

    // Buscar el juego_id por código
    const { data: juego, error: juegoError } = await this.supa.client
      .schema('esquema_juegos')
      .from('juegos')
      .select('id')
      .eq('codigo', params.gameCode)
      .maybeSingle();

    if (juegoError) throw juegoError;
    if (!juego) {
      throw new Error(`Juego con código '${params.gameCode}' no encontrado`);
    }

    // Insertar en esquema_juegos.partidas
    const metaData: any = params.metaJson || {};
    if (params.durationSec !== undefined) {
      metaData.duration_sec = params.durationSec;
    }

    const { data, error } = await this.supa.client
      .schema('esquema_juegos')
      .from('partidas')
      .insert({
        usuario_id: usuarioId,
        juego_id: juego.id,
        puntaje: params.points,
        datos_extra: Object.keys(metaData).length > 0 ? metaData : null,
        gano: null
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: user.id, // UUID de Supabase Auth
      gameCode: params.gameCode,
      points: Number(data.puntaje),
      durationSec: params.durationSec,
      createdAt: data.fecha_partida,
      metaJson: data.datos_extra ?? undefined,
    };
  }

  async listRecent(limit = 100): Promise<ScoreWithUser[]> {
    // Obtener partidas con relaciones
    const { data: partidas, error } = await this.supa.client
      .schema('esquema_juegos')
      .from('partidas')
      .select(`
        id, usuario_id, juego_id, puntaje, datos_extra, fecha_partida,
        usuarios:usuario_id ( nombre, apellido, email, supabase_uid ),
        juegos:juego_id ( codigo, nombre )
      `)
      .order('fecha_partida', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[score.service] Error al obtener partidas:', error);
      throw error;
    }
    
    if (!partidas || partidas.length === 0) {
      return [];
    }
    
    // Si las relaciones no funcionaron, hacer consultas separadas para obtener los datos faltantes
    const juegoIds = [...new Set(partidas.map((p: any) => p.juego_id).filter(Boolean))];
    const usuarioIds = [...new Set(partidas.map((p: any) => p.usuario_id).filter(Boolean))];
    
    // Obtener juegos si faltan
    let juegosMap: Map<number, any> = new Map();
    if (juegoIds.length > 0) {
      const juegosConCodigo = partidas.filter((p: any) => p.juegos?.codigo);
      if (juegosConCodigo.length < partidas.length) {
        // Algunas relaciones fallaron, hacer consulta separada
        const { data: juegos, error: juegosError } = await this.supa.client
          .schema('esquema_juegos')
          .from('juegos')
          .select('id, codigo, nombre')
          .in('id', juegoIds);
        
        if (!juegosError && juegos) {
          juegos.forEach((j: any) => juegosMap.set(j.id, j));
        }
      } else {
        // Las relaciones funcionaron, crear map desde los datos
        partidas.forEach((p: any) => {
          if (p.juegos && p.juego_id) {
            juegosMap.set(p.juego_id, p.juegos);
          }
        });
      }
    }
    
    // Obtener usuarios si faltan
    let usuariosMap: Map<number, any> = new Map();
    if (usuarioIds.length > 0) {
      const usuariosConSupabaseUid = partidas.filter((p: any) => p.usuarios?.supabase_uid);
      if (usuariosConSupabaseUid.length < partidas.length) {
        // Algunas relaciones fallaron, hacer consulta separada
        const { data: usuarios, error: usuariosError } = await this.supa.client
          .schema('esquema_juegos')
          .from('usuarios')
          .select('id, nombre, apellido, email, supabase_uid')
          .in('id', usuarioIds);
        
        if (!usuariosError && usuarios) {
          usuarios.forEach((u: any) => usuariosMap.set(u.id, u));
        }
      } else {
        // Las relaciones funcionaron, crear map desde los datos
        partidas.forEach((p: any) => {
          if (p.usuarios && p.usuario_id) {
            usuariosMap.set(p.usuario_id, p.usuarios);
          }
        });
      }
    }
    
    // Mapear resultados
    return partidas.map((r: any) => {
      const meta = r.datos_extra || {};
      
      // Obtener datos del usuario (de relación o de map)
      const usuario = r.usuarios || usuariosMap.get(r.usuario_id);
      const displayName = usuario
        ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() 
        : '—';
      const supabaseUid = usuario?.supabase_uid || null;
      
      // Obtener código del juego (de relación o de map)
      const juego = r.juegos || juegosMap.get(r.juego_id);
      const gameCode = juego?.codigo || null;
      
      if (!gameCode) {
        console.warn(`[score.service] No se pudo obtener código del juego para juego_id=${r.juego_id}`);
      }
      
      return {
        id: r.id?.toString() || '', // Convertir bigint a string
        userId: supabaseUid, // UUID de Supabase Auth
        gameCode: gameCode as any, // GameCode type
        points: Number(r.puntaje || 0),
        durationSec: meta.duration_sec ?? undefined,
        createdAt: r.fecha_partida,
        metaJson: r.datos_extra ?? undefined,
        userDisplayName: displayName,
        userAvatarUrl: undefined, // no está en el esquema
      };
    });
  }

  async leaderboard(game: GameCode, limit = 10) {
    // Buscar el juego_id por código
    const { data: juego, error: juegoError } = await this.supa.client
      .schema('esquema_juegos')
      .from('juegos')
      .select('id')
      .eq('codigo', game)
      .maybeSingle();

    if (juegoError) throw juegoError;
    if (!juego) {
      throw new Error(`Juego con código '${game}' no encontrado`);
    }

    // Obtener mejores puntajes por usuario para este juego
    const { data, error } = await this.supa.client
      .schema('esquema_juegos')
      .from('partidas')
      .select(`
        usuario_id, puntaje,
        usuarios:usuario_id ( nombre, apellido, email )
      `)
      .eq('juego_id', juego.id)
      .order('puntaje', { ascending: false })
      .limit(limit * 2); // tomar más para luego agrupar por usuario

    if (error) throw error;

    // Agrupar por usuario y tomar el mejor puntaje
    const userBest: Map<number, any> = new Map();
    (data || []).forEach((r: any) => {
      const userId = r.usuario_id;
      const currentBest = userBest.get(userId);
      if (!currentBest || r.puntaje > currentBest.puntaje) {
        userBest.set(userId, {
          user_id: userId,
          game_code: game,
          best_points: r.puntaje,
          display_name: r.usuarios 
            ? `${r.usuarios.nombre} ${r.usuarios.apellido || ''}`.trim() 
            : '—'
        });
      }
    });

    return Array.from(userBest.values())
      .sort((a, b) => b.best_points - a.best_points)
      .slice(0, limit);
  }

}




// private async ensureProfile(user: any) {
//   // Evitar Foreign Key fallando si todavia no existe fila en profiles
//   const display = user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Jugador';
//   await this.supa.client.from('profiles').upsert({
//     id: user.id,
//     display_name: display,
//     avatar_url: user.user_metadata?.avatar_url ?? null
//   }, { onConflict: 'id' });
// }

// private async ensureProfile(user: any) {
//   const display = user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Jugador';

//   const { data: exists } = await this.supa.client
//     .from('profiles').select('id').eq('id', user.id).maybeSingle();

//   if (!exists) {
//     await this.supa.client.from('profiles').insert({
//       id: user.id, display_name: display, avatar_url: user.user_metadata?.avatar_url ?? null
//     });
//   } else {
//     await this.supa.client.from('profiles').update({
//       display_name: display, avatar_url: user.user_metadata?.avatar_url ?? null
//     }).eq('id', user.id);
//   }
// }


// async recordScore(params: {
//   gameCode: GameCode;
//   points: number;
//   durationSec?: number;
//   metaJson?: Record<string, unknown>;
// }): Promise<Score> {
//   const { data: { user } } = await this.supa.client.auth.getUser();
//   if (!user) throw new Error('No hay usuario logueado');

//   // ✅ aseguramos que exista el profile antes del insert en scores
//   await this.ensureProfile(user);

//   // ...resto del insert a 'scores' (como ya lo tenías)
//   // ...
//   throw new Error('pegá aquí el código de insert que ya tenías'); // <- quitalo al pegar
// }