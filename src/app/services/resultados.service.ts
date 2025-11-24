import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

type Json = Record<string, any> | null;

interface GuardarScoreArgs {
  game_code: string;     // ej: 'preguntados_dbz'
  points: number;        // total aciertos (0..10)
  duration_sec?: number; // opcional
  meta?: Json;           // se mapea a meta_json
}

@Injectable({ providedIn: 'root' })
export class ResultadosService {
  private supabase = inject(SupabaseService);

  async guardarScore({ game_code, points, duration_sec, meta }: GuardarScoreArgs) {
    const { data: { session }, error: sErr } = await this.supabase.client.auth.getSession();
    if (sErr || !session?.user) {
      console.warn('[resultados] no session; omitiendo guardado');
      return { ok: false as const, reason: 'no-session' as const };
    }

    // Obtener usuario_id de esquema_juegos.usuarios
    const usuarioId = await this.supabase.getUsuarioIdFromSupabaseUid(session.user.id);
    if (!usuarioId) {
      console.warn('[resultados] usuario no encontrado en esquema_juegos.usuarios');
      return { ok: false as const, reason: 'usuario-no-encontrado' as const };
    }

    // Buscar el juego_id por código
    const { data: juego, error: juegoError } = await this.supabase.client
      .schema('esquema_juegos')
      .from('juegos')
      .select('id')
      .eq('codigo', game_code)
      .maybeSingle();

    if (juegoError) {
      console.error('[resultados] error buscando juego:', juegoError);
      return { ok: false as const, error: juegoError };
    }
    if (!juego) {
      console.warn(`[resultados] juego '${game_code}' no encontrado`);
      return { ok: false as const, reason: 'juego-no-encontrado' as const };
    }

    // Preparar datos_extra
    const datosExtra: any = meta || {};
    if (duration_sec !== undefined) {
      datosExtra.duration_sec = duration_sec;
    }

    // Insertar en esquema_juegos.partidas
    const { error } = await this.supabase.client
      .schema('esquema_juegos')
      .from('partidas')
      .insert({
        usuario_id: usuarioId,
        juego_id: juego.id,
        puntaje: points,
        datos_extra: Object.keys(datosExtra).length > 0 ? datosExtra : null,
        gano: null
      });

    if (error) {
      console.error('[resultados] insert error:', error);
      return { ok: false as const, error };
    }
    return { ok: true as const };
  }
}








// import { Injectable, inject } from '@angular/core';
// import { SupabaseService } from './supabase.service';

// export interface ResultadoInsert {
//   game: string;   // 'preguntados-dbz'
//   score: number;  // total de aciertos de la ronda (0..10)
//   detail?: any;   // ej: { preguntas: 10 }
// }

// @Injectable({ providedIn: 'root' })
// export class ResultadosService {
//   private supabase = inject(SupabaseService);


//   private readonly TABLE = 'scores';


//   private readonly USE_PUNTAJE = false;

//   async guardar({ game, score, detail }: ResultadoInsert) {
//     const { data: { session }, error: sErr } = await this.supabase.client.auth.getSession();
//     if (sErr || !session?.user) {
//       console.warn('[ResultadosService] No session, no se guarda.');
//       return { ok: false, reason: 'no-session' as const };
//     }

//     const base = {
//       user_id: session.user.id,
//       email: session.user.email,
//       game,
//       detail: detail ?? null,
//       created_at: new Date().toISOString(),
//     };

//     // arma el row según el nombre de columna que tengas en DB
//     const row = this.USE_PUNTAJE
//       ? { ...base, puntaje: score }
//       : { ...base, score };

//     const { error } = await this.supabase.client.from(this.TABLE).insert(row);
//     if (error) {
//       console.error('[ResultadosService] insert error:', error);
//       return { ok: false, error };
//     }
//     return { ok: true };
//   }
// }




// import { Injectable, inject } from '@angular/core';
// import { SupabaseService } from './supabase.service';

// export interface ResultadoInsert {
//   game: string;       // 'preguntados-dbz'
//   score: number;      // total de aciertos de la ronda
//   detail?: any;       // { preguntas: 10 } u otros datos
// }

// @Injectable({ providedIn: 'root' })
// export class ResultadosService {
//   private supabase = inject(SupabaseService);

//   // Si en tus otros juegos usaste 'scores', cambiá a 'scores'
//   private readonly TABLE = 'results';

//   async guardar({ game, score, detail }: ResultadoInsert) {
//     const { data: { session }, error: sErr } = await this.supabase.client.auth.getSession();
//     if (sErr || !session?.user) return { ok: false, reason: 'no-session' as const };

//     const row = {
//       user_id: session.user.id,
//       email: session.user.email,
//       game,
//       score,
//       detail: detail ?? null,
//       created_at: new Date().toISOString()
//     };

//     const { error } = await this.supabase.client.from(this.TABLE).insert(row);
//     if (error) {
//       console.error('[ResultadosService] insert error:', error);
//       return { ok: false, error };
//     }
//     return { ok: true };
//   }
// }



// import { Injectable, inject } from '@angular/core';
// import { SupabaseService } from './supabase.service';

// export interface ResultadoInsert {
//   game: string;          // EJEMPLO: 'preguntados-dbz'
//   score: number;         // PUNTOS A SUMAR = 1
//   detail?: any;          // OPCIONAL: datos de la pregunta/opciones
// }

// @Injectable({ providedIn: 'root' })
// export class ResultadosService {
//   private supabase = inject(SupabaseService);

//   // CAMBIAR EL NOMBRE EJ. SI LA tabla se llama 'scores', DEBE CAMBIARSE ACA:
//   private readonly TABLE = 'results';

//   async guardar({ game, score, detail }: ResultadoInsert) {
//     const { data: { session } } = await this.supabase.client.auth.getSession();
//     if (!session?.user) return { ok: false, reason: 'no-session' as const };

//     const row = {
//       user_id: session.user.id,
//       email: session.user.email,
//       game,
//       score,
//       detail: detail ?? null,
//       created_at: new Date().toISOString()
//     };

//     const { error } = await this.supabase.client.from(this.TABLE).insert(row);
//     if (error) {
//       console.error('[ResultadosService] Error insert:', error);
//       return { ok: false, error };
//     }
//     return { ok: true };
//   }
// }

