import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

// Podés llevarte esta interfaz a tu carpeta de models si preferís
export interface LoginLog {
  id: number;
  user_id: string | null;
  email: string | null;
  created_at: string;
  exito: boolean;
  componente?: string | null;
  funcion?: string | null;
  descripcion?: string | null;
  ip?: string | null;
  user_agent?: string | null;
}

@Injectable({ providedIn: 'root' })
export class LogsJuegosService {

  constructor(private readonly supa: SupabaseService) {}

  /**
   * Registra un ingreso (exitoso o fallido) o una acción en la Sala de Juegos.
   */
  async registrarLog(
    supabaseUid: string, 
    exito: boolean = true,
    componente?: string, 
    funcion?: string, 
    descripcion?: string
  ): Promise<void> {
    try {
      // Usamos el método que ya tenés en SupabaseService para traducir el UID a tu ID numérico
      const usuarioId = await this.supa.getUsuarioIdFromSupabaseUid(supabaseUid);
      
      if (!usuarioId) {
        console.warn('[LogsJuegos] No se encontró el usuario en esquema_juegos para registrar el log.');
        return;
      }

      const { error } = await this.supa.client
        .schema('esquema_juegos')
        .from('log_logins')
        .insert({ 
          usuario_id: usuarioId,
          exito,
          componente: componente ?? null,
          funcion: funcion ?? null,
          descripcion: descripcion ?? null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        });
        
      if (error) {
        console.error('[LogsJuegos] Error al insertar en log_logins', error);
      }
    } catch (e) {
      console.error('[LogsJuegos] Excepción al registrar log', e);
    }
  }

  /**
   * Obtiene el historial de logs cruzando datos con la tabla de usuarios para traer el email.
   */
  async obtenerLogs(limit = 100): Promise<LoginLog[]> {
    const { data, error } = await this.supa.client
      .schema('esquema_juegos')
      .from('log_logins')
      .select('*, usuarios(email)') 
      .order('fecha_ingreso', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('[LogsJuegos] Error al consultar log_logins', error);
      throw error;
    }
    
    // Mapeo limpio a la interfaz
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.usuario_id?.toString() || null,
      email: row.usuarios?.email || 'Desconocido', 
      created_at: row.fecha_ingreso,
      exito: row.exito,
      componente: row.componente,
      funcion: row.funcion,
      descripcion: row.descripcion,
      ip: row.ip,
      user_agent: row.user_agent
    })) as LoginLog[];
  }
}