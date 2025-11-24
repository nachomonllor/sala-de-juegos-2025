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
    const { data, error } = await this.supa.client
      .schema('esquema_juegos')
      .from('partidas')
      .select(`
        id, usuario_id, juego_id, puntaje, datos_extra, fecha_partida,
        usuarios:usuario_id ( nombre, apellido, email ),
        juegos:juego_id ( codigo, nombre )
      `)
      .order('fecha_partida', { ascending: false })
      .limit(limit);
    if (error) throw error;
    
    return (data ?? []).map((r: any) => {
      const meta = r.datos_extra || {};
      const displayName = r.usuarios 
        ? `${r.usuarios.nombre} ${r.usuarios.apellido || ''}`.trim() 
        : '—';
      
      return {
        id: r.id,
        userId: r.usuario_id?.toString() || null,
        gameCode: r.juegos?.codigo || null,
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