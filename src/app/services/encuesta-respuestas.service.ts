import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface RespuestaPreguntaDetalle {
  id: number;
  preguntaId: number;
  textoPregunta: string;
  tipoControl: string | null;
  valorLibre: string | null;
  opcionTexto: string | null;
  opcionValor: string | null;
}

export interface EncuestaRespuestaAdmin {
  id: number;
  encuestaId: number;
  nombreApellido: string;
  edad: number;
  telefono: string;
  completadaEn: string;
  usuario?: {
    nombre: string | null;
    apellido: string | null;
    email: string | null;
  };
  respuestas: RespuestaPreguntaDetalle[];
}

@Injectable({ providedIn: 'root' })
export class EncuestaRespuestasService {
  constructor(private readonly supa: SupabaseService) {}

  async listRespuestas(limit = 100): Promise<EncuestaRespuestaAdmin[]> {
    const { data, error } = await this.supa.client
      .schema('esquema_juegos')
      .from('respuestas_encuesta')
      .select(`
        id,
        encuesta_id,
        usuario_id,
        nombre_apellido,
        edad,
        telefono,
        completada_en,
        usuarios:usuario_id (
          nombre,
          apellido,
          email
        ),
        respuestas:respuestas_pregunta (
          id,
          pregunta_id,
          opcion_id,
          valor_texto,
          pregunta:preguntas_encuesta (
            texto,
            tipo_control
          ),
          opcion:opciones_pregunta (
            texto,
            valor
          )
        )
      `)
      .order('completada_en', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[EncuestaRespuestasService] Error listando respuestas:', error);
      throw error;
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      encuestaId: row.encuesta_id,
      nombreApellido: row.nombre_apellido,
      edad: row.edad,
      telefono: row.telefono,
      completadaEn: row.completada_en,
      usuario: row.usuarios
        ? {
            nombre: row.usuarios.nombre ?? null,
            apellido: row.usuarios.apellido ?? null,
            email: row.usuarios.email ?? null
          }
        : undefined,
      respuestas: (row.respuestas ?? []).map((resp: any) => ({
        id: resp.id,
        preguntaId: resp.pregunta_id,
        textoPregunta: resp.pregunta?.texto ?? '(Pregunta no disponible)',
        tipoControl: resp.pregunta?.tipo_control ?? null,
        valorLibre: resp.valor_texto ?? null,
        opcionTexto: resp.opcion?.texto ?? null,
        opcionValor: resp.opcion?.valor ?? null,
      })) as RespuestaPreguntaDetalle[],
    }));
  }
}

