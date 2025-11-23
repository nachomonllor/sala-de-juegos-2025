import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { GameCode, Score, ScoreWithUser } from '../models/resultados';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  constructor(private supa: SupabaseService) { }

  private async ensureProfile(user: any) {
    const display =
      user.user_metadata?.name ??
      user.email?.split('@')[0] ??
      'Jugador';

    const { data: exists } = await this.supa.client
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!exists) {
      await this.supa.client.from('profiles').insert({
        id: user.id,
        display_name: display,
        avatar_url: user.user_metadata?.avatar_url ?? null
      });
    } else {
      await this.supa.client
        .from('profiles')
        .update({
          display_name: display,
          avatar_url: user.user_metadata?.avatar_url ?? null
        })
        .eq('id', user.id);
    }
  }

   private async getCurrentUserPrueba() {
     console.log('getCurrentUser - antes de getUser');
  } 

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
    
    //SOLO user ACA
    const { data: { user }, error: userErr } = await this.supa.client.auth.getUser();
    if (userErr) throw userErr;
    if (!user) throw new Error('No hay usuario logueado');

    // PARA VER EL TOKEN:
     const { data: { session } } = await this.supa.client.auth.getSession();
     console.log('TOKEN?', !!session?.access_token);

    // USAR RPC o INSERT directo (EL QUE SE ESTE USANDO). Ejemplo con RPC:
    const { data, error } = await this.supa.client.rpc('record_score', {
      p_game_code: params.gameCode,
      p_points: params.points,
      p_duration_sec: params.durationSec ?? null,
      p_meta_json: params.metaJson ?? null
    });
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

  async listRecent(limit = 100): Promise<ScoreWithUser[]> {
    const { data, error } = await this.supa.client
      .from('scores')
      .select(`
        id, user_id, game_code, points, duration_sec, created_at, meta_json,
        profiles: user_id ( display_name, avatar_url )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      gameCode: r.game_code,
      points: Number(r.points),
      durationSec: r.duration_sec ?? undefined,
      createdAt: r.created_at,
      metaJson: r.meta_json ?? undefined,
      userDisplayName: r.profiles?.display_name ?? '—',
      userAvatarUrl: r.profiles?.avatar_url ?? undefined,
    }));
  }

  async leaderboard(game: GameCode, limit = 10) {
    const { data, error } = await this.supa.client
      .from('v_leaderboard')
      .select('*')
      .eq('game_code', game)
      .order('best_points', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
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